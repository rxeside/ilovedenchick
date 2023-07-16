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

type IDdata struct {
	ID int `db:"id"`
}

type tanktype struct {
	ID        int
	X         float64
	Y         float64
	Direction string
	Distance  float64
}

type roomData struct {
	NumOfPlayers int
	Level        leveldata
	Objects      []*objdata
	Tanks        map[*websocket.Conn]*tanktype
}

var currLevel leveldata
var Objects []*objdata

var rooms []*roomData

const currRoom = 1

func level(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		levelIDstr := mux.Vars(r)["levelID"]
		levelID, err := strconv.Atoi(levelIDstr)
		if err != nil {
			http.Error(w, "Err with levelID", 500)
			log.Println(err.Error())
		}

		// rooms[currRoom].Level, err = getLevelByID(db, levelID)
		currLevel, err = getLevelByID(db, levelID)
		if err != nil {
			http.Error(w, "Error with getting a level by ID", 500)
			log.Println(err.Error())
		}

		// rooms[currRoom].Objects, err = getObjByID(db, levelID)
		Objects, err = getObjByID(db, levelID)
		if err != nil {
			http.Error(w, "Error with getting an object by ID", 500)
			log.Println(err.Error())
		}

		ts, err := template.ParseFiles("pages/level.html")
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err.Error())
			return
		}

		err = ts.Execute(w, nil)
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err.Error())
			return
		}
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

var clients = make(map[*websocket.Conn]bool)

// Функция handler является обработчиком HTTP запросов.

func handler(w http.ResponseWriter, r *http.Request) {
	var tank tanktype
	var levelSide float64
	var sideValue float64
	var step float64

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err.Error())
		return
	}

	// rooms[currRoom].NumOfPlayers += 1
	// rooms[currRoom].Tanks[conn].ID = rooms[currRoom].NumOfPlayers
	// tank = rooms[currRoom].Tanks[conn]
	clients[conn] = true

	ticker := time.NewTicker(50 * time.Millisecond)

	// err = conn.WriteJSON(rooms[currRoom].Level)
	err = conn.WriteJSON(currLevel)
	if err != nil {
		log.Println(err.Error())
		return
	}

	go func() {
		for {
			_, m, err := conn.ReadMessage()
			if err != nil {
				log.Println(err.Error())
				return
			}

			message := string(m)
			readMessageFromCleints(conn, ticker, &tank, message, &levelSide, &sideValue, &step)
		}
	}()

	for {
		select {
		case <-ticker.C:
			sendMessageForCleints(&tank)
			// ticker = time.NewTicker(time.Second)
		}
	}
}

func sendMessageForCleints(tank *tanktype) {
	// for client := range rooms[currRoom].Tanks {
	// 	err := client.WriteMessage(websocket.TextMessage, []byte("Ans from server"))
	// 	if err != nil {
	// 		log.Println(err.Error())
	// 		delete(rooms[currRoom].Tanks, client)
	// 		rooms[currRoom].NumOfPlayers -= 1
	// 		return
	// 	}
	// }

	for client := range clients {
		err := client.WriteJSON(tank)
		if err != nil {
			log.Println(err)
			delete(clients, client)
		}
	}
}

func readMessageFromCleints(conn *websocket.Conn, ticker *time.Ticker, tank *tanktype, message string, levelSide *float64, sideValue *float64, step *float64) {
	var err error

	switch message {
	case "level":
		*levelSide, err = getFloatFromSocket(conn)
		if err != nil {
			log.Println(err.Error())
			return
		}

		*sideValue = *levelSide / float64(currLevel.Side)
		// sideValue = levelSide / float64(rooms[currRoom].Level.Side)
		*step = *sideValue / 50
		fmt.Println(*step)

		// for _, value := range rooms[currRoom].Objects {
		for _, value := range Objects {
			value.Pos_X = value.Pos_X * *sideValue
			value.Pos_Y = value.Pos_Y * *sideValue
		}

		tank.X = *levelSide/2 - *sideValue
		tank.Y = *levelSide/2 - *sideValue

		err = conn.WriteJSON(Objects)
		// err = conn.WriteJSON(rooms[currRoom].Objects)
		if err != nil {
			log.Println(err.Error())
			return
		}
	case "moving":
		newX, err := getFloatFromSocket(conn)
		if err != nil {
			log.Println(err.Error())
			return
		}

		newY, err := getFloatFromSocket(conn)
		if err != nil {
			log.Println(err.Error())
			return
		}

		tank.X = newX
		tank.Y = newY

		err = conn.WriteJSON(tank)
		if err != nil {
			log.Println(err.Error())
			return
		}
	case "dir":
		_, m, err := conn.ReadMessage()
		if err != nil {
			log.Println(err.Error())
			return
		}
		dir := string(m)
		tank.Direction = dir

		findDistance(conn, tank, dir, *levelSide, *sideValue)

		moveTank(tank, *step)
	case "f":
		findDistance(conn, tank, "1", *levelSide, *sideValue)
		findDistance(conn, tank, "2", *levelSide, *sideValue)
		findDistance(conn, tank, "3", *levelSide, *sideValue)
		findDistance(conn, tank, "4", *levelSide, *sideValue)
	case "Close":
		conn.Close()
		ticker.Stop()
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
	ticker := time.NewTicker(time.Millisecond)

	for range ticker.C {
		calculateCoordinates(tank, step)
		tank.Distance -= step

		if tank.Distance <= step {
			// calculateCoordinates(tank, tank.Distance)
			tank.Distance = 0
			ticker.Stop()
			return
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

func findDistance(conn *websocket.Conn, tank *tanktype, dir string, levelside float64, sideValue float64) {

	min := calculateStartDistance(tank, dir, levelside, sideValue)
	// var minO objdata

	// for _, value := range rooms[1].Objects {
	for _, value := range Objects {
		if isCollision(tank, value, dir, sideValue) {
			distance := calculateDistance(tank, value, dir, sideValue)

			if distance < min {
				min = distance
				// minO = *value
			}
		}
	}

	// err := conn.WriteJSON(minO)
	// if err != nil {
	// 	log.Println(err.Error())
	// 	return
	// }

	// err = conn.WriteJSON(tank.X)
	// if err != nil {
	// 	log.Println(err.Error())
	// 	return
	// }

	// err = conn.WriteJSON(dir)
	// if err != nil {
	// 	log.Println(err.Error())
	// 	return
	// }

	// err := conn.WriteJSON(min)
	// if err != nil {
	// 	log.Println(err.Error())
	// 	return
	// }

	tank.Distance = min

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
