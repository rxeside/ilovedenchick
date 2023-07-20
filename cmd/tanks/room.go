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
	"github.com/jmoiron/sqlx"
)

type levelPage struct {
	RoomKey int
}

type leveldata struct {
	Id          string `db:"id"`
	Name        string `db:"name"`
	Side        int    `db:"side"`
	Author      string `db:"author"`
	IsCompleted int    `db:"is_Completed"`
}

type objdata struct {
	ID             int     `db:"id"`
	Name           string  `db:"name"`
	IsDestructible int     `db:"is_Destructible"`
	CanTPass       int     `db:"can_T_pass"`
	CanBPass       int     `db:"can_B_pass"`
	ImgURL         string  `db:"imageURL"`
	Pos_X          float64 `db:"pos_x"`
	Pos_Y          float64 `db:"pos_y"`
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
	TankID int
	X      int
	Y      int
}

type roomdata struct {
	// Key     int
	LastID  int
	Level   leveldata
	Objects []*objdata
	Tanks   map[*websocket.Conn]*tanktype
	Bullets []*bullettype
	Status  string
}

// var currLevel leveldata
// var Objects []*objdata

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
					fmt.Println("Del")
					return
				} else {
					if len(currRoom.Tanks) > 0 {
						sendMessageForCleints(currRoom.Tanks)
					}
				}
			}
		}
	}()

	fmt.Println("Exit")
	return
}

func sendMessageForCleints(tanks map[*websocket.Conn]*tanktype) {
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

func sendMessageAboutTanks() {

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

func getLevelByID(db *sqlx.DB, levelID int) (leveldata, error) {
	const query = `
			SELECT
			  id,
			  name,
			  side,
			  author,
			  is_Completed
			FROM
			  level
			WHERE
			  id = ?
	`

	var level leveldata

	err := db.Get(&level, query, levelID)
	if err != nil {
		return leveldata{}, err
	}

	return level, nil
}

func getObjByID(db *sqlx.DB, levelID int) ([]*objdata, error) {
	const query = `
			SELECT
			  id,
			  name,
			  is_Destructible,
			  can_T_pass,
			  can_B_pass,
			  imageURL,
			  pos_x,
			  pos_y
			FROM
			  level_obj
			WHERE
			  id_level = ?
	`
	var obj []*objdata

	err := db.Select(&obj, query, levelID)
	if err != nil {
		return nil, err
	}

	return obj, nil
}

// Сначала мы создаем экземпляр upgrader, который будет использоваться для обновления HTTP соединения до WebSocket соединения.
// Мы устанавливаем размеры буферов чтения и записи равными 1024 байтам.
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

// var clients = make(map[*websocket.Conn]bool)

// Функция handler является обработчиком HTTP запросов.

// func handler(w http.ResponseWriter, r *http.Request) {
// 	// var tank tanktype
// 	// var levelSide float64
// 	// var sideValue float64
// 	// var step float64

// 	conn, err := upgrader.Upgrade(w, r, nil)
// 	if err != nil {
// 		log.Println(err.Error())
// 		return
// 	}

// 	// rooms[currRoom].NumOfPlayers += 1
// 	// rooms[currRoom].Tanks[conn].ID = rooms[currRoom].NumOfPlayers
// 	// tank = rooms[currRoom].Tanks[conn]
// 	clients[conn] = true

// 	err = conn.WriteJSON(rooms[currRoom].Level)
// 	err = conn.WriteJSON(currLevel)
// 	if err != nil {
// 		log.Println(err.Error())
// 		return
// 	}

// 	var ticker *time.Ticker

// 	go func() {
// 		for {
// 			_, m, err := conn.ReadMessage()
// 			if err != nil {
// 				log.Println(err.Error())
// 				return
// 			}

// 			message := string(m)
// 			readMessageFromCleints(conn, ticker, &tank, message, &levelSide, &sideValue, &step)
// 		}
// 	}()
// }

func readMessageFromCleints(conn *websocket.Conn, currRoom *roomdata, Objects *[]*objdata, tank *tanktype, message string, levelSide *float64, sideValue *float64, step *float64) {
	var err error

	switch message {
	case "level":
		*levelSide, err = getFloatFromSocket(conn)
		if err != nil {
			log.Println(err.Error())
			return
		}

		// *sideValue = *levelSide / float64(currLevel.Side)
		*sideValue = *levelSide / float64(currRoom.Level.Side)
		*step = *sideValue / 5

		for _, value := range currRoom.Objects {
			// for _, value := range Objects {
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
		// err = conn.WriteJSON(rooms[currRoom].Objects)
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

		findDistance(conn, *Objects, tank, dir, *levelSide, *sideValue)

		go func() {
			moveTank(tank, *step)
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

func moveTank(tank *tanktype, step float64) {
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

		calculateCoordinates(tank, step)
		tank.Distance -= step
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

func findDistance(conn *websocket.Conn, Objects []*objdata, tank *tanktype, dir string, levelside float64, sideValue float64) {

	min := calculateStartDistance(tank, dir, levelside, sideValue)

	// for _, value := range rooms[1].Objects {
	for _, value := range Objects {
		if isCollision(tank, value, dir, sideValue) {
			distance := calculateDistance(tank, value, dir, sideValue)

			if distance < min {
				min = distance
			}
		}
	}

	tank.Distance = min
	tank.IsChanged = true

	return
}

func calculateStartDistance(tank *tanktype, dir string, levelside float64, sideValue float64) float64 {
	switch dir {
	case "1":
		return tank.Y
	case "2":
		return levelside - tank.Y - sideValue*0.95
	case "3":
		return tank.X
	case "4":
		return levelside - tank.X - sideValue*0.95
	}

	return 0
}

func calculateDistance(tank *tanktype, obj *objdata, dir string, sideValue float64) float64 {
	switch dir {
	case "1":
		return tank.Y - obj.Pos_Y - sideValue
	case "2":
		return obj.Pos_Y - tank.Y - sideValue*0.95
	case "3":
		return tank.X - obj.Pos_X - sideValue
	case "4":
		return obj.Pos_X - tank.X - sideValue*0.95
	}

	return 0
}

func isCollision(tank *tanktype, object *objdata, dir string, sideValue float64) bool {
	switch dir {
	case "1":
		if (object.CanTPass == 0) && (tank.Y > object.Pos_Y) && (tank.X+sideValue*0.95 > object.Pos_X) && (tank.X-sideValue*0.95 < object.Pos_X) {
			return true
		}
	case "2":
		if (object.CanTPass == 0) && (tank.Y < object.Pos_Y) && (tank.X+sideValue*0.95 > object.Pos_X) && (tank.X-sideValue*0.95 < object.Pos_X) {
			return true
		}
	case "3":
		if (object.CanTPass == 0) && (tank.X > object.Pos_X) && (tank.Y+sideValue*0.95 > object.Pos_Y) && (tank.Y-sideValue*0.95 < object.Pos_Y) {
			return true
		}
	case "4":
		if (object.CanTPass == 0) && (tank.X < object.Pos_X) && (tank.Y+sideValue*0.95 > object.Pos_Y) && (tank.Y-sideValue*0.95 < object.Pos_Y) {
			return true
		}
	}

	return false
}
