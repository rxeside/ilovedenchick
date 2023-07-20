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

type levelPage struct {
	RoomKey int
}

type tanktype struct {
	ID        int
	X         float64
	Y         float64
	Direction string
	Distance  float64
	IsChanged bool
	Status    string
}

type bullettype struct {
	Start_X   float64
	Start_Y   float64
	End_X     float64
	End_Y     float64
	Direction string
	ObjID     int
}

type roomdata struct {
	LastID  int
	Level   leveldata
	Objects []*objdata
	Tanks   map[*websocket.Conn]*tanktype
	Bullets map[int]*bullettype
	Status  string
}

type messageAboutBullets struct {
	Message string
	Bullets map[int]*bullettype
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
						sendMessageForCleints(*currRoom)
					}
				}
			}
		}
	}()
	return
}

func sendMessageForCleints(currRoom roomdata) {
	if len(currRoom.Bullets) > 0 {
		sendMessageAboutBullets(currRoom.Tanks, currRoom.Bullets)
	}
	sendMessageAboutTanks(currRoom.Tanks)
}

func sendMessageAboutBullets(tanks map[*websocket.Conn]*tanktype, Bullets map[int]*bullettype) {
	var Message messageAboutBullets
	Message.Message = "Bullets"
	Message.Bullets = Bullets
	for conn, value := range tanks {
		if value.Status != "Load" {
			err := conn.WriteJSON(Message)
			if err != nil {
				log.Println(err)
				delete(tanks, conn)
			}
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
			value.IsChanged = false
			err := conn.WriteJSON(tanksForSend)
			if err != nil {
				log.Println(err)
				delete(tanks, conn)
			}
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
		*step = *sideValue / 5

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

		tank.Distance = findDistance(*Objects, tank, dir, *levelSide, *sideValue)

		go func() {
			moveTank(tank, currRoom.Bullets, *step)
		}()
	case "stopMoving":
		// partOfWay, err := getFloatFromSocket(conn)
		// if err != nil {
		// 	log.Println(err.Error())
		// 	return
		// }

		// calculateCoordinates(tank, partOfWay)

		tank.Distance = 0
		// tank.IsChanged = true
	case "Fire":
		bullet := createNewBullet(tank, *Objects, *levelSide, *sideValue)
		currRoom.Bullets[tank.ID] = &bullet
		go func() {
			bulletFlight(&bullet, currRoom, tank.ID)
		}()
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

func moveTank(tank *tanktype, bullets map[int]*bullettype, step float64) {
	ticker := time.NewTicker(100 * time.Millisecond)

	for range ticker.C {
		if tank.Distance == 0 {
			ticker.Stop()
			return
		}

		if (tank.Distance <= step) && (tank.Distance < 0) {
			calculateCoordinates(tank, tank.Distance-(step*0.1))
			tank.Distance = 0
			ticker.Stop()
			return
		}

		if !isCollisionwithBullet(tank, bullets, step) {
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

	min := calculateStartDistance(tank.X, tank.Y, dir, levelside, sideValue*0.95)

	for _, value := range Objects {
		if isCollision(tank.X, tank.Y, value, value.CanTPass, dir, sideValue*0.95, sideValue) {
			distance := calculateDistance(tank.X, tank.Y, value, dir, sideValue*0.95, sideValue)

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
		newBullet.Start_Y = tank.Y - sideValue*0.3
		newBullet.Start_X = tank.X + (sideValue*0.95-sideValue*0.25)/2
	case "2":
		newBullet.Start_Y = tank.Y + sideValue*0.95
		newBullet.Start_X = tank.X + (sideValue*0.95-sideValue*0.25)/2
	case "3":
		newBullet.Start_Y = tank.Y + (sideValue*0.95-sideValue*0.25)/2
		newBullet.Start_X = tank.X - sideValue*0.3
	case "4":
		newBullet.Start_Y = tank.Y + (sideValue*0.95-sideValue*0.25)/2
		newBullet.Start_X = tank.X + sideValue*0.95
	}

	findEndCoordinatesOfBullet(&newBullet, objects, levelSide, sideValue)

	fmt.Printf("newBullet: %v\n", newBullet)
	return newBullet
}

func findEndCoordinatesOfBullet(bullet *bullettype, objects []*objdata, levelSide float64, sideValue float64) {

	minD := calculateStartDistance(bullet.Start_X, bullet.Start_Y, bullet.Direction, levelSide, sideValue*0.3)

	for _, value := range objects {
		if isCollision(bullet.Start_X, bullet.Start_Y, value, value.CanBPass, bullet.Direction, sideValue*0.25, sideValue) {
			distance := calculateDistance(bullet.Start_X, bullet.Start_Y, value, bullet.Direction, sideValue*0.3, sideValue)

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

func isCollision(X float64, Y float64, object *objdata, CanPass int, dir string, side float64, sideOfObj float64) bool {
	switch dir {
	case "1":
		if (CanPass == 0) && (Y > object.Pos_Y) && (X+side > object.Pos_X) && (X-sideOfObj < object.Pos_X) {
			return true
		}
	case "2":
		if (CanPass == 0) && (Y < object.Pos_Y) && (X+side > object.Pos_X) && (X-sideOfObj < object.Pos_X) {
			return true
		}
	case "3":
		if (CanPass == 0) && (X > object.Pos_X) && (Y+side > object.Pos_Y) && (Y-sideOfObj < object.Pos_Y) {
			return true
		}
	case "4":
		if (CanPass == 0) && (X < object.Pos_X) && (Y+side > object.Pos_Y) && (Y-sideOfObj < object.Pos_Y) {
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

func calculateDistance(X float64, Y float64, obj *objdata, dir string, side float64, sideValue float64) float64 {
	switch dir {
	case "1":
		return Y - obj.Pos_Y - sideValue
	case "2":
		return obj.Pos_Y - Y - side
	case "3":
		return X - obj.Pos_X - sideValue
	case "4":
		return obj.Pos_X - X - side
	}

	return 0
}

func bulletFlight(bullet *bullettype, room *roomdata, ID int) {
	isDestoyed := false

	go func() {
		ticker := time.NewTicker(time.Second)
		var value int

		for range ticker.C {
			if value == 5 {
				isDestoyed = true
			} else {
				value++
			}

			if isDestoyed {
				ticker.Stop()
				return
			}
		}

		return
	}()

	for !isDestoyed {
	}

	fmt.Println("Delete")
	delete(room.Bullets, ID)
	return
}
