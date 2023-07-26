package main

import (
	"fmt"
	"html/template"
	"log"
	"math/rand"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"github.com/jmoiron/sqlx"
)

const (
	size         = 100.0
	tankstep     = size / 10
	bulletstep   = tankstep * 5
	bullet_len   = 0.3 * size
	tanksize     = 0.9 * size
	bullet_width = 0.25 * size
)

type levelPage struct {
	RoomKey int
}

type tanktype struct {
	ID        int
	X         float64
	Y         float64
	Direction string
	Distance  float64
	Update    bool
	Live      int
	Status    string
}

type bullettype struct {
	Start_X   float64
	Start_Y   float64
	End_X     float64
	End_Y     float64
	Direction string
	ObjID     int
	Destroy   bool
}

type roomdata struct {
	LastID           int
	Level            leveldata
	Objects          []*objdata
	ObjToRemove      []int
	Tanks            map[*websocket.Conn]*tanktype
	Bullets          map[int]*bullettype
	PointsToSpawn    []*positionstruct
	PlayersAreLiving int
	Status           string
}

type messageAboutBullets struct {
	Message string
	Bullets map[int]*bullettype
}

type messageAboutObjects struct {
	Message string
	Objects []int
}

type positionstruct struct {
	X float64
	Y float64
}

type messageReset struct {
	Message string
	Objects []*objdata
}

var rooms = make(map[int]*roomdata)

func roomIsRunning(db *sqlx.DB, key int) {
	currRoom := rooms[key]

	ticker := time.NewTicker(33 * time.Millisecond)

	for currRoom.PlayersAreLiving == 0 {
	}

	go func() {
		for {
			select {
			case <-ticker.C:
				// fmt.Printf("len(currRoom.Tanks): %v\n", len(currRoom.Tanks))
				if (currRoom.Status == "Remove") || (currRoom.PlayersAreLiving <= 0) {
					fmt.Println("Remove")
					delete(rooms, key)
					return
				} else if currRoom.Status == "Reset" {
					resetRoom(db, currRoom)
					sendMessageAboutReset(currRoom)
				} else { //if currRoom.PlayersAreLiving > 1 {
					if len(currRoom.Tanks) > 0 {
						sendMessageForCleints(currRoom)
					}
				}
				// } else {
				// fmt.Println("Reset")
				// fmt.Println("Start")
				// }
			}
		}
	}()
	return
}

func sendMessageForCleints(currRoom *roomdata) {
	if len(currRoom.ObjToRemove) > 0 {
		sendMessageAboutObj(currRoom, &currRoom.ObjToRemove)
	}
	if len(currRoom.Bullets) > 0 {
		sendMessageAboutBullets(currRoom, &currRoom.Bullets)
	}
	sendMessageAboutTanks(currRoom)
}

func sendMessageAboutReset(currRoom *roomdata) {
	var Message messageReset
	Message.Message = "Reset"
	Message.Objects = currRoom.Objects

	for conn := range currRoom.Tanks {
		err := conn.WriteJSON(Message)
		if err != nil {
			log.Println(err.Error())
			delete(currRoom.Tanks, conn)
			currRoom.PlayersAreLiving--
			return
		}
	}

	time.Sleep(1 * time.Second)
	currRoom.Status = "Game"
	return
}

func sendMessageAboutObj(currRoom *roomdata, ObjtoRemove *[]int) {
	var Message messageAboutObjects
	Message.Message = "Objects"
	Message.Objects = *ObjtoRemove

	for conn, value := range currRoom.Tanks {
		if value.Status != "Load" {
			err := conn.WriteJSON(Message)
			if err != nil {
				log.Println(err)
				delete(currRoom.Tanks, conn)
				currRoom.PlayersAreLiving--
			}
		}
	}

	*ObjtoRemove = nil
}

func sendMessageAboutBullets(currRoom *roomdata, Bullets *map[int]*bullettype) {
	var Message messageAboutBullets
	Message.Message = "Bullets"
	Message.Bullets = *Bullets

	for conn, value := range currRoom.Tanks {
		if value.Status != "Load" {
			err := conn.WriteJSON(Message)
			if err != nil {
				log.Println(err)
				delete(currRoom.Tanks, conn)
				currRoom.PlayersAreLiving--
			}
		}
	}

	for index, bullet := range *Bullets {
		if bullet.Destroy {
			delete(*Bullets, index)
		}
	}
}

func sendMessageAboutTanks(currRoom *roomdata) {
	var tanksForSend []*tanktype
	for _, value := range currRoom.Tanks {
		newTank := *value

		tanksForSend = append(tanksForSend, &newTank)
	}

	for conn, value := range currRoom.Tanks {
		if value.Status != "Load" {
			err := conn.WriteJSON(tanksForSend)
			if err != nil {
				log.Println(err)
				delete(currRoom.Tanks, conn)
				currRoom.PlayersAreLiving--
			}
			value.Update = false
		}
	}

}

func roomPage(w http.ResponseWriter, r *http.Request) {
	roomKeystr := mux.Vars(r)["roomKey"]
	roomKey, err := strconv.Atoi(roomKeystr)
	if err != nil {
		http.Error(w, "Err with roomKey", 500)
		log.Println(err.Error())
	}

	_, ok := rooms[roomKey]
	if !ok {
		http.Error(w, "Room Not Found", 500)
		return
	}

	ts, err := template.ParseFiles("pages/room.html")
	if err != nil {
		http.Error(w, "Internal Server Error", 500)
		log.Println(err.Error())
		return
	}

	data := levelPage{
		RoomKey: roomKey,
	}

	err = ts.Execute(w, data)
	if err != nil {
		http.Error(w, "Internal Server Error", 500)
		log.Println(err.Error())
		return
	}
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func wsConnection(w http.ResponseWriter, r *http.Request) {
	roomKeystr := mux.Vars(r)["roomKey"]
	roomKey, err := strconv.Atoi(roomKeystr)
	if err != nil {
		http.Error(w, "Err with roomKey", 500)
		log.Println(err.Error())
	}

	currRoom := rooms[roomKey]

	var tank tanktype

	currRoom.Status = "Load"
	currRoom.LastID++
	currRoom.PlayersAreLiving++
	tank.ID = currRoom.LastID
	tank.Status = "Load"
	tank.Direction = "1"
	tank.Live = 3

	levelSize := float64(currRoom.Level.Side) * size

	max := len(currRoom.PointsToSpawn)
	spawnIndex := rand.Intn(max)

	if max > 0 {
		for index, value := range currRoom.PointsToSpawn {
			if index == spawnIndex {
				tank.X = value.X
				tank.Y = value.Y
			}
		}
	} else {
		tank.X = 0
		tank.Y = 0
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err.Error())
		return
	}
	currRoom.Tanks[conn] = &tank

	err = conn.WriteJSON(currRoom.Level)
	if err != nil {
		log.Println(err.Error())
		return
	}

	err = conn.WriteJSON(currRoom.Objects)
	if err != nil {
		log.Println(err.Error())
		return
	}

	go func() {
		ticker := time.NewTicker(50 * time.Millisecond)
		for range ticker.C {
			isHit := hitByBullet(&tank, &currRoom.Bullets)

			if isHit {
				deadTank(currRoom, &tank)
			}
		}
	}()

	tank.Status = "Play"

	for {
		_, m, err := conn.ReadMessage()
		if err != nil {
			log.Println(err.Error())
			return
		}

		message := string(m)
		readMessageFromCleints(conn, currRoom, &tank, message, &levelSize)
	}
}

func readMessageFromCleints(conn *websocket.Conn, currRoom *roomdata, tank *tanktype, message string, levelSize *float64) {
	var err error

	switch message {
	case "tanks":
		var Tanks []*tanktype
		for _, value := range currRoom.Tanks {
			newTank := *value

			Tanks = append(Tanks, &newTank)
		}

		err = conn.WriteJSON(Tanks)
		if err != nil {
			log.Println(err.Error())
			return
		}
	case "move":
		_, m, err := conn.ReadMessage()
		if err != nil {
			log.Println(err.Error())
			return
		}
		dir := string(m)
		tank.Direction = dir
		tank.Distance = findDistance(currRoom.Objects, tank, tank.Direction, *levelSize)
		tank.Update = true

		if tank.Status != "Moving" {
			tank.Status = "Moving"
			go func() {
				moveTank(tank, currRoom.Objects, *levelSize)
			}()
		}
	case "stopMoving":
		tank.Distance = 0
		tank.Update = true
		if tank.Status == "Collision" {
			tank.Status = "Staying"
		}
	case "Fire":
		_, ok := currRoom.Bullets[tank.ID]
		if !ok {
			bullet := createNewBullet(tank, currRoom.Objects, *levelSize)
			currRoom.Bullets[tank.ID] = &bullet
			go func() {
				bulletFlight(&bullet, currRoom, *levelSize)
			}()
		}
	case "Close":
		conn.Close()
		return
	}
}

func moveTank(tank *tanktype, Objects []*objdata, levelSize float64) {
	ticker := time.NewTicker(50 * time.Millisecond)

	for range ticker.C {
		if tank.Distance <= 0 {
			tank.Distance = 0
			ticker.Stop()
			if tank.Status != "Collision" {
				tank.Status = "Staying"
			}
			return
		}
		tank.Distance = findDistance(Objects, tank, tank.Direction, levelSize)

		if (tank.Distance <= tankstep) && (tank.Distance > 0) {
			calculateCoordinates(tank, tank.Distance-(tankstep*0.1))
			tank.Distance = 0
			tank.Status = "Collision"
		}

		if tank.Distance > tankstep {
			calculateCoordinates(tank, tankstep)
			tank.Distance -= tankstep
		}
	}
}

func calculateCoordinates(tank *tanktype, step float64) {
	switch tank.Direction {
	case "1":
		tank.Y -= step
	case "2":
		tank.Y += step
	case "3":
		tank.X -= step
	case "4":
		tank.X += step
	}
}

func findDistance(Objects []*objdata, tank *tanktype, dir string, levelSize float64) float64 {

	min := calculateStartDistance(tank.X, tank.Y, dir, levelSize, tanksize)

	for _, value := range Objects {
		if isCollision(tank.X, tank.Y, value.Pos_X, value.Pos_Y, value.CanTPass, dir, tanksize, size) {
			distance := calculateDistance(tank.X, tank.Y, value.Pos_X, value.Pos_Y, dir, tanksize, size)

			if distance < min {
				min = distance
			}
		}
	}

	return min
}

func createNewBullet(tank *tanktype, objects []*objdata, levelSize float64) bullettype {
	var newBullet bullettype
	newBullet.Direction = tank.Direction
	newBullet.Destroy = false
	newBullet.ObjID = -1

	switch tank.Direction {
	case "1":
		newBullet.Start_Y = tank.Y - bullet_len
		newBullet.Start_X = tank.X + (tanksize-bullet_width)/2
	case "2":
		newBullet.Start_Y = tank.Y + tanksize
		newBullet.Start_X = tank.X + (tanksize-bullet_width)/2
	case "3":
		newBullet.Start_Y = tank.Y + (tanksize-bullet_width)/2
		newBullet.Start_X = tank.X - bullet_len
	case "4":
		newBullet.Start_Y = tank.Y + (tanksize-bullet_width)/2
		newBullet.Start_X = tank.X + tanksize
	}

	findEndCoordinatesOfBullet(&newBullet, objects, levelSize)
	return newBullet
}

func findEndCoordinatesOfBullet(bullet *bullettype, objects []*objdata, levelSize float64) {

	minD := calculateStartDistance(bullet.Start_X, bullet.Start_Y, bullet.Direction, levelSize, bullet_len)

	for _, value := range objects {
		if isCollision(bullet.Start_X, bullet.Start_Y, value.Pos_X, value.Pos_Y, value.CanBPass, bullet.Direction, bullet_width, size) {
			distance := calculateDistance(bullet.Start_X, bullet.Start_Y, value.Pos_X, value.Pos_Y, bullet.Direction, bullet_len, size)

			if distance < minD {
				minD = distance
				bullet.ObjID = value.ID
			}
		}
	}

	calculateEndCoordinates(bullet, bullet.Direction, minD)
}

func calculateEndCoordinates(bullet *bullettype, dir string, distance float64) {
	switch dir {
	case "1":
		bullet.End_Y = bullet.Start_Y - distance
		bullet.End_X = bullet.Start_X
	case "2":
		bullet.End_Y = bullet.Start_Y + distance
		bullet.End_X = bullet.Start_X
	case "3":
		bullet.End_Y = bullet.Start_Y
		bullet.End_X = bullet.Start_X - distance
	case "4":
		bullet.End_Y = bullet.Start_Y
		bullet.End_X = bullet.Start_X + distance
	}
}

func isCollision(X1 float64, Y1 float64, X2 float64, Y2 float64, CanPass int, dir string, size1 float64, size2 float64) bool {
	switch dir {
	case "1":
		if (CanPass == 0) && (Y1 > Y2) && (X1+size1 > X2) && (X1-size2 < X2) {
			return true
		}
	case "2":
		if (CanPass == 0) && (Y1 < Y2) && (X1+size1 > X2) && (X1-size2 < X2) {
			return true
		}
	case "3":
		if (CanPass == 0) && (X1 > X2) && (Y1+size1 > Y2) && (Y1-size2 < Y2) {
			return true
		}
	case "4":
		if (CanPass == 0) && (X1 < X2) && (Y1+size1 > Y2) && (Y1-size2 < Y2) {
			return true
		}
	}

	return false
}

func calculateStartDistance(X float64, Y float64, dir string, levelSize float64, size float64) float64 {
	switch dir {
	case "1":
		return Y
	case "2":
		return levelSize - Y - size
	case "3":
		return X
	case "4":
		return levelSize - X - size
	}

	return 0
}

func calculateDistance(X1 float64, Y1 float64, X2 float64, Y2 float64, dir string, size1 float64, size2 float64) float64 {
	switch dir {
	case "1":
		return Y1 - Y2 - size2
	case "2":
		return Y2 - Y1 - size1
	case "3":
		return X1 - X2 - size2
	case "4":
		return X2 - X1 - size1
	}

	return 0
}

func bulletFlight(bullet *bullettype, room *roomdata, levelSize float64) {
	bullet.Destroy = ((bullet.Start_X == bullet.End_X) && (bullet.Start_Y == bullet.End_Y))

	go func() {
		ticker := time.NewTicker(50 * time.Millisecond)

		for range ticker.C {

			if bullet.Destroy {
				ticker.Stop()
				return
			}

			moveBullet(bullet)
			findEndCoordinatesOfBullet(bullet, room.Objects, levelSize)
			bullet.Destroy = ((bullet.Start_X == bullet.End_X) && (bullet.Start_Y == bullet.End_Y))
		}

		return
	}()

	for !bullet.Destroy {
	}

	room.Objects = destoyedObj(room, bullet.ObjID)

	return
}

func moveBullet(bullet *bullettype) {
	switch bullet.Direction {
	case "1":
		if bullet.Start_Y-bullet.End_Y > bulletstep {
			bullet.Start_Y = bullet.Start_Y - bulletstep
		} else {
			bullet.Start_Y = bullet.End_Y
		}
	case "2":
		if bullet.End_Y-bullet.Start_Y > bulletstep {
			bullet.Start_Y = bullet.Start_Y + bulletstep
		} else {
			bullet.Start_Y = bullet.End_Y
		}
	case "3":
		if bullet.Start_X-bullet.End_X > bulletstep {
			bullet.Start_X = bullet.Start_X - bulletstep
		} else {
			bullet.Start_X = bullet.End_X
		}
	case "4":
		if bullet.End_X-bullet.Start_X > bulletstep {
			bullet.Start_X = bullet.Start_X + bulletstep
		} else {
			bullet.Start_X = bullet.End_X
		}
	}
}

func destoyedObj(room *roomdata, ObjID int) []*objdata {
	objects := room.Objects
	objIndex := -1

	for index, value := range objects {
		if (value.ID == ObjID) && (value.IsDestructible == 1) {
			objIndex = index
		}
	}

	if objIndex != -1 {
		room.ObjToRemove = append(room.ObjToRemove, objects[objIndex].ID)

		objects = append(objects[:objIndex], objects[objIndex+1:]...)
	}

	return objects
}

func hitByBullet(tank *tanktype, bullets *map[int]*bullettype) bool {
	for _, bullet := range *bullets {

		if (!bullet.Destroy) && (isCollision(bullet.Start_X, bullet.Start_Y, tank.X, tank.Y, 0, bullet.Direction, bullet_len, tanksize)) {
			distance := calculateDistance(bullet.Start_X, bullet.Start_Y, tank.X, tank.Y, bullet.Direction, bullet_len, tanksize)
			if distance < bullet_len {
				bullet.Destroy = true
				bullet.ObjID = -1
				return true
			}
		}
	}

	return false
}

func deadTank(room *roomdata, tank *tanktype) {
	if tank.Live > 0 {
		resetTank(room, tank)
	} else {
		tank.Status = "Dead"
		room.PlayersAreLiving--
		room.Status = "Reset"
	}

	return
}

func resetTank(room *roomdata, tank *tanktype) {
	tank.Live--

	max := len(room.PointsToSpawn)
	spawnIndex := rand.Intn(max)

	if max > 0 {
		for index, value := range room.PointsToSpawn {
			if index == spawnIndex {
				tank.X = value.X
				tank.Y = value.Y
			}
		}
	} else {
		tank.X = 0
		tank.Y = 0
	}

	return
}

func resetRoom(db *sqlx.DB, room *roomdata) {
	room.ObjToRemove = nil
	room.Bullets = make(map[int]*bullettype)
	room.PlayersAreLiving = 0
	for _, tank := range room.Tanks {
		tank.Live = 3
		room.PlayersAreLiving++

		max := len(room.PointsToSpawn)
		spawnIndex := rand.Intn(max)

		if max > 0 {
			for index, value := range room.PointsToSpawn {
				if index == spawnIndex {
					tank.X = value.X
					tank.Y = value.Y
				}
			}
		} else {
			tank.X = 0
			tank.Y = 0
		}
	}

	var err error
	room.Objects, err = getObjByID(db, room.Level.Id)
	if err != nil {
		log.Println(err.Error())
		return
	}

	for _, value := range room.Objects {
		value.Pos_Y *= size
		value.Pos_X *= size
	}

	fmt.Println("Reset")

	return
}
