package main

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

const (
	tanksize     = 0.9
	bullet_width = 0.25
	bullet_len   = 0.3
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
	LastID      int
	Level       leveldata
	Objects     []*objdata
	ObjToRemove []int
	Tanks       map[*websocket.Conn]*tanktype
	Bullets     map[int]*bullettype
	Status      string
}

type messageAboutBullets struct {
	Message string
	Bullets map[int]*bullettype
}

type messageAboutObjects struct {
	Message string
	Objects []int
}

var rooms = make(map[int]*roomdata)

func roomIsRunning(key int) {
	currRoom := rooms[key]

	ticker := time.NewTicker(33 * time.Millisecond)

	go func() {
		for {
			select {
			case <-ticker.C:
				// fmt.Printf("len(currRoom.Tanks): %v\n", len(currRoom.Tanks))
				if currRoom.Status == "Remove" {
					delete(rooms, key)
					return
				} else {
					if len(currRoom.Tanks) > 0 {
						sendMessageForCleints(currRoom)
					}
				}
			}
		}
	}()
	return
}

func sendMessageForCleints(currRoom *roomdata) {
	if len(currRoom.ObjToRemove) > 0 {
		sendMessageAboutObj(currRoom.Tanks, &currRoom.ObjToRemove)
	}
	if len(currRoom.Bullets) > 0 {
		sendMessageAboutBullets(currRoom.Tanks, &currRoom.Bullets)
	}
	sendMessageAboutTanks(currRoom.Tanks)
}

func sendMessageAboutObj(tanks map[*websocket.Conn]*tanktype, ObjtoRemove *[]int) {
	var Message messageAboutObjects
	Message.Message = "Objects"
	Message.Objects = *ObjtoRemove

	for conn, value := range tanks {
		if value.Status != "Load" {
			err := conn.WriteJSON(Message)
			if err != nil {
				log.Println(err)
				delete(tanks, conn)
			}
		}
	}

	*ObjtoRemove = nil
}

func sendMessageAboutBullets(tanks map[*websocket.Conn]*tanktype, Bullets *map[int]*bullettype) {
	var Message messageAboutBullets
	Message.Message = "Bullets"
	Message.Bullets = *Bullets

	for conn, value := range tanks {
		if value.Status != "Load" {
			err := conn.WriteJSON(Message)
			if err != nil {
				log.Println(err)
				delete(tanks, conn)
			}
		}
	}

	for index, bullet := range *Bullets {
		if bullet.Destroy {
			delete(*Bullets, index)
		}
	}
}

func sendMessageAboutTanks(tanks map[*websocket.Conn]*tanktype) {
	var tanksForSend []*tanktype
	for _, value := range tanks {
		newTank := *value

		tanksForSend = append(tanksForSend, &newTank)
	}

	for conn, value := range tanks {
		if value.Status != "Load" {
			err := conn.WriteJSON(tanksForSend)
			if err != nil {
				log.Println(err)
				delete(tanks, conn)
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
	fmt.Println("Finded")

	fmt.Printf("currRoom: %v\n", currRoom)

	var tank tanktype

	currRoom.Status = "Load"
	currRoom.LastID++
	tank.ID = currRoom.LastID
	tank.Status = "Load"
	tank.Direction = "1"
	var levelSide float64
	var sideValue float64
	var step float64
	var Objects []*objdata

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

	go func() {
		ticker := time.NewTicker(50 * time.Millisecond)
		for range ticker.C {
			isHit := hitByBullet(&tank, &currRoom.Bullets, sideValue)

			if isHit {
				deadTank(&tank)
			}
		}
	}()

	for {
		_, m, err := conn.ReadMessage()
		if err != nil {
			log.Println(err.Error())
			return
		}

		message := string(m)
		readMessageFromCleints(conn, currRoom, &Objects, &tank, message, &levelSide, &sideValue, &step)
	}
}

func readMessageFromCleints(conn *websocket.Conn, currRoom *roomdata, Objects *[]*objdata, tank *tanktype, message string, levelSide *float64, sideValue *float64, step *float64) {
	var err error

	switch message {
	case "level":
		*levelSide, err = getFloatFromSocket(conn)
		if err != nil {
			log.Println(err.Error())
			return
		}

		*sideValue = *levelSide / float64(currRoom.Level.Side)
		*step = *sideValue / 10

		for _, value := range currRoom.Objects {
			var newObj objdata
			newObj.ID = value.ID
			newObj.Name = value.Name
			newObj.IsDestructible = value.IsDestructible
			newObj.CanTPass = value.CanTPass
			newObj.CanBPass = value.CanBPass
			newObj.ImgURL = value.ImgURL
			newObj.Pos_X = value.Pos_X * *sideValue
			newObj.Pos_Y = value.Pos_Y * *sideValue
			*Objects = append(*Objects, &newObj)
		}

		tank.X = *levelSide/2 - *sideValue
		tank.Y = *levelSide/2 - *sideValue

		err = conn.WriteJSON(*Objects)
		if err != nil {
			log.Println(err.Error())
			return
		}

		tank.Status = "CanPlay"
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
		tank.Distance = findDistance(*Objects, tank, tank.Direction, *levelSide, *sideValue)
		tank.Update = true

		if tank.Status != "Moving" {
			tank.Status = "Moving"
			go func() {
				moveTank(tank, *Objects, currRoom.Bullets, *step, *levelSide, *sideValue)
			}()
		}
	case "stopMoving":
		tank.Distance = 0
		tank.Update = true
	case "Fire":
		_, ok := currRoom.Bullets[tank.ID]
		if !ok {
			bullet := createNewBullet(tank, *Objects, *levelSide, *sideValue)
			currRoom.Bullets[tank.ID] = &bullet
			go func() {
				bulletFlight(&bullet, currRoom, Objects, tank.ID, *step*3)
			}()
		}
	case "Close":
		conn.Close()
		return
	}
}

func getFloatFromSocket(conn *websocket.Conn) (float64, error) {
	_, m, err := conn.ReadMessage()
	if err != nil {
		return 0, err
	}

	str := string(m[:])
	value, err := strconv.ParseFloat(str, 64)
	if err != nil {
		return 0, err
	}

	return value, nil
}

func moveTank(tank *tanktype, Objects []*objdata, bullets map[int]*bullettype, step float64, levelSide float64, sideValue float64) {
	ticker := time.NewTicker(50 * time.Millisecond)

	for range ticker.C {
		if tank.Distance <= 0 {
			tank.Distance = 0
			ticker.Stop()
			tank.Status = "Staying"
			return
		}
		tank.Distance = findDistance(Objects, tank, tank.Direction, levelSide, sideValue)

		if (tank.Distance <= step) && (tank.Distance > 0) {
			calculateCoordinates(tank, tank.Distance-(step*0.1))
			tank.Distance = 0
		}

		if tank.Distance > step {
			calculateCoordinates(tank, step)
			tank.Distance -= step
		}
	}
}

func isCollisionwithBullet(tank *tanktype, bullets map[int]*bullettype, step float64) bool {

	return false
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

func findDistance(Objects []*objdata, tank *tanktype, dir string, levelside float64, sideValue float64) float64 {

	min := calculateStartDistance(tank.X, tank.Y, dir, levelside, sideValue*tanksize)

	for _, value := range Objects {
		if isCollision(tank.X, tank.Y, value.Pos_X, value.Pos_Y, value.CanTPass, dir, sideValue*tanksize, sideValue) {
			distance := calculateDistance(tank.X, tank.Y, value.Pos_X, value.Pos_Y, dir, sideValue*tanksize, sideValue)

			if distance < min {
				min = distance
			}
		}
	}

	return min
}

func createNewBullet(tank *tanktype, objects []*objdata, levelSide float64, sideValue float64) bullettype {
	var newBullet bullettype
	newBullet.Direction = tank.Direction
	newBullet.ObjID = -1

	switch tank.Direction {
	case "1":
		newBullet.Start_Y = tank.Y - sideValue*bullet_len
		newBullet.Start_X = tank.X + (sideValue*tanksize-sideValue*bullet_width)/2
	case "2":
		newBullet.Start_Y = tank.Y + sideValue*tanksize
		newBullet.Start_X = tank.X + (sideValue*tanksize-sideValue*bullet_width)/2
	case "3":
		newBullet.Start_Y = tank.Y + (sideValue*tanksize-sideValue*bullet_width)/2
		newBullet.Start_X = tank.X - sideValue*bullet_len
	case "4":
		newBullet.Start_Y = tank.Y + (sideValue*tanksize-sideValue*bullet_width)/2
		newBullet.Start_X = tank.X + sideValue*tanksize
	}

	findEndCoordinatesOfBullet(&newBullet, objects, levelSide, sideValue)
	return newBullet
}

func findEndCoordinatesOfBullet(bullet *bullettype, objects []*objdata, levelSide float64, sideValue float64) {

	minD := calculateStartDistance(bullet.Start_X, bullet.Start_Y, bullet.Direction, levelSide, sideValue*bullet_len)

	for _, value := range objects {
		if isCollision(bullet.Start_X, bullet.Start_Y, value.Pos_X, value.Pos_Y, value.CanBPass, bullet.Direction, sideValue*bullet_width, sideValue) {
			distance := calculateDistance(bullet.Start_X, bullet.Start_Y, value.Pos_X, value.Pos_Y, bullet.Direction, sideValue*bullet_len, sideValue)

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

func isCollision(X1 float64, Y1 float64, X2 float64, Y2 float64, CanPass int, dir string, side1 float64, side2 float64) bool {
	switch dir {
	case "1":
		if (CanPass == 0) && (Y1 > Y2) && (X1+side1 > X2) && (X1-side2 < X2) {
			return true
		}
	case "2":
		if (CanPass == 0) && (Y1 < Y2) && (X1+side1 > X2) && (X1-side2 < X2) {
			return true
		}
	case "3":
		if (CanPass == 0) && (X1 > X2) && (Y1+side1 > Y2) && (Y1-side2 < Y2) {
			return true
		}
	case "4":
		if (CanPass == 0) && (X1 < X2) && (Y1+side1 > Y2) && (Y1-side2 < Y2) {
			return true
		}
	}

	return false
}

func calculateStartDistance(X float64, Y float64, dir string, levelside float64, side float64) float64 {
	switch dir {
	case "1":
		return Y
	case "2":
		return levelside - Y - side
	case "3":
		return X
	case "4":
		return levelside - X - side
	}

	return 0
}

func calculateDistance(X1 float64, Y1 float64, X2 float64, Y2 float64, dir string, side1 float64, side2 float64) float64 {
	switch dir {
	case "1":
		return Y1 - Y2 - side2
	case "2":
		return Y2 - Y1 - side1
	case "3":
		return X1 - X2 - side2
	case "4":
		return X2 - X1 - side1
	}

	return 0
}

func bulletFlight(bullet *bullettype, room *roomdata, objects *[]*objdata, ID int, step float64) {
	bullet.Destroy = ((bullet.Start_X == bullet.End_X) && (bullet.Start_Y == bullet.End_Y))

	go func() {
		ticker := time.NewTicker(50 * time.Millisecond)

		for range ticker.C {

			if bullet.Destroy {
				ticker.Stop()
				return
			}

			moveBullet(bullet, step)
			bullet.Destroy = ((bullet.Start_X == bullet.End_X) && (bullet.Start_Y == bullet.End_Y))
		}

		return
	}()

	for !bullet.Destroy {
	}

	room.Objects = destoyedObj(room, bullet.ObjID)

	//Удаление из objects
	objIndex := -1
	for index, value := range *objects {
		if (value.ID == bullet.ObjID) && (value.IsDestructible == 1) {
			objIndex = index
		}
	}
	if objIndex != -1 {
		obj := *objects
		*objects = append(obj[:objIndex], obj[objIndex+1:]...)
	}

	return
}

func moveBullet(bullet *bullettype, step float64) {
	switch bullet.Direction {
	case "1":
		if bullet.Start_Y-bullet.End_Y > step {
			bullet.Start_Y = bullet.Start_Y - step
		} else {
			bullet.Start_Y = bullet.End_Y
		}
	case "2":
		if bullet.End_Y-bullet.Start_Y > step {
			bullet.Start_Y = bullet.Start_Y + step
		} else {
			bullet.Start_Y = bullet.End_Y
		}
	case "3":
		if bullet.Start_X-bullet.End_X > step {
			bullet.Start_X = bullet.Start_X - step
		} else {
			bullet.Start_X = bullet.End_X
		}
	case "4":
		if bullet.End_X-bullet.Start_X > step {
			bullet.Start_X = bullet.Start_X + step
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

func hitByBullet(tank *tanktype, bullets *map[int]*bullettype, sideValue float64) bool {
	for i, bullet := range *bullets {

		if isCollision(bullet.Start_X, bullet.Start_Y, tank.X, tank.Y, 0, bullet.Direction, sideValue*bullet_len, sideValue*tanksize) {
			distance := calculateDistance(bullet.Start_X, bullet.Start_Y, tank.X, tank.Y, bullet.Direction, sideValue*bullet_len, sideValue*tanksize)
			if distance < sideValue*bullet_len {
				bullet.Destroy = true
				bullet.ObjID = -1
				fmt.Println("Is hit")
				fmt.Printf("i: %v\n", i)
				return true
			}
		}
	}

	return false
}

func deadTank(tank *tanktype) {
	tank.X = 0
	tank.Y = 0
}
