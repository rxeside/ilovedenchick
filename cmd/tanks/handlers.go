package main

import (
	"encoding/json"
	"html/template"
	"io"
	"log"
	"net/http"
	"strconv"

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
	Name           string  `db:"name"`
	IsDestructible int     `db:"is_Destructible"`
	CanTPass       int     `db:"can_T_pass"`
	CanBPass       int     `db:"can_B_pass"`
	ImgURL         string  `db:"imageURL"`
	Pos_X          float64 `db:"pos_x"`
	Pos_Y          float64 `db:"pos_y"`
}

var levelID int

type saveLevelRequest struct {
	Name   string `json:"name"`
	Side   string `json:"side"`
	Author string `json:"author"`
}

type saveCellRequest struct {
	Name            string `json:"name"`
	Is_Destructible int    `json:"isDestructible"`
	CanTPass        int    `json:"canTpass"`
	CanBPass        int    `json:"canBpass"`
	Img_URL         string `json:"imgURL"`
	Pos_x           int    `json:"x"`
	Pos_y           int    `json:"y"`
}

type IDdata struct {
	ID int `db:"id"`
}

type tanktype struct {
	ID int
	X  float64
	Y  float64
}

var currLevel leveldata

var objects []*objdata

func level(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		levelIDstr := mux.Vars(r)["levelID"]
		levelID, err := strconv.Atoi(levelIDstr)
		if err != nil {
			http.Error(w, "Err with levelID", 500)
			log.Println(err.Error())
		}

		currLevel, err = getLevelByID(db, levelID)
		if err != nil {
			http.Error(w, "Error with getting a level by ID", 500)
			log.Println(err.Error())
		}

		objects, err = getObjByID(db, levelID)
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

// var broadcast = make(chan []byte)

// Функция handler является обработчиком HTTP запросов.
func handler(w http.ResponseWriter, r *http.Request) {
	var tank tanktype
	var levelSide float64
	var sideValue float64

	conn, err := upgrader.Upgrade(w, r, nil)
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

		message := string(m[:])

		switch message {
		case "level":
			err = conn.WriteJSON(currLevel)
			if err != nil {
				log.Println(err.Error())
				return
			}

			levelSide, err = getLevelSide(conn)
			if err != nil {
				log.Println(err.Error())
				return
			}

			sideValue = levelSide / float64(currLevel.Side)

			for _, value := range objects {
				value.Pos_X = value.Pos_X * sideValue
				value.Pos_Y = value.Pos_Y * sideValue
			}

			tank.X = levelSide/2 - sideValue
			tank.Y = levelSide/2 - sideValue

			err = conn.WriteJSON(objects)
			if err != nil {
				log.Println(err.Error())
				return
			}
		case "moving":
			// err = moveTank(&tank, conn, levelSide, sideValue)
			_, m, err := conn.ReadMessage()
			if err != nil {
				log.Println(err.Error())
				return
			}

			str := string(m)
			dir, err := strconv.Atoi(str)
			if err != nil {
				log.Println(err.Error())
				return
			}

			findDistance(conn, &tank, dir, levelSide, sideValue)
			if err != nil {
				log.Println(err.Error())
				return
			}
		case "dir":
			findDistance(conn, &tank, 1, levelSide, sideValue)
		}
	}
}

func findDistance(conn *websocket.Conn, tank *tanktype, dir int, levelside float64, sideValue float64) {
	min := 100000.0

	for _, value := range objects {
		switch dir {
		case 1:
			if (value.CanTPass == 0) && (tank.Y > value.Pos_Y) && (tank.X+sideValue > value.Pos_X) && (tank.X-sideValue < value.Pos_X) {
				distance := tank.Y - value.Pos_Y - sideValue
				if distance < min {
					min = distance
				}
			}

			if tank.Y < min {
				min = tank.Y
			}
		case 2:
			if (value.CanTPass == 0) && (tank.Y < value.Pos_Y) && (tank.X+sideValue > value.Pos_X) && (tank.X-sideValue < value.Pos_X) {
				distance := value.Pos_Y - tank.Y - sideValue
				if distance < min {
					min = distance
				}
			}

			if levelside-tank.Y < min {
				min = levelside - tank.Y - sideValue
			}
		case 3:
			if (value.CanTPass == 0) && (tank.X > value.Pos_X) && (tank.Y+sideValue > value.Pos_Y) && (tank.Y-sideValue < value.Pos_Y) {
				distance := tank.X - value.Pos_X - sideValue
				if distance < min {
					min = distance
				}
			}

			if tank.X < min {
				min = tank.X
			}
		case 4:
			if (value.CanTPass == 0) && (tank.X < value.Pos_X) && (tank.Y+sideValue > value.Pos_Y) && (tank.Y-sideValue < value.Pos_Y) {
				distance := value.Pos_X - tank.X - sideValue
				if distance < min {
					min = distance
				}
			}

			if levelside-tank.X < min {
				min = levelside - tank.X - sideValue
			}
		}
	}

	err := conn.WriteJSON(min)
	if err != nil {
		log.Println(err.Error())
		return
	}

	return

}

func getLevelSide(conn *websocket.Conn) (float64, error) {
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

// func moveTank(tank *tanktype, conn *websocket.Conn, levelSide float64, sideValue float64) error {

// 	var step = 4.0
// 	_, m, err := conn.ReadMessage()
// 	if err != nil {
// 		return err
// 	}
// 	message := string(m[:])

// 	canMove := collision(tank, objects, message, step, levelSide, sideValue)
// 	if canMove == false {
// 		return nil
// 	}

// 	switch message {
// 	case "1":
// 		tank.Y -= step
// 	case "2":
// 		tank.Y += step
// 	case "3":
// 		tank.X -= step
// 	case "4":
// 		tank.X += step
// 	}

// 	err = conn.WriteJSON(tank)
// 	if err != nil {
// 		return err
// 	}

// 	return nil
// }

// func collision(tank *tanktype, objects []*objdata, message string, step float64, levelSide float64, sideValue float64) bool {
// 	if message == "1" {
// 		for _, value := range objects {
// 			if ((value.CanTPass == 0) && (tank.Y+sideValue > value.Pos_Y) && (tank.Y < value.Pos_Y+sideValue+step) && (tank.X+sideValue > value.Pos_X) && (tank.X < value.Pos_X+sideValue)) || (tank.Y <= 0) {
// 				return false
// 			}
// 		}
// 	}

// 	if message == "2" {
// 		for _, value := range objects {
// 			if ((value.CanTPass == 0) && (tank.Y+sideValue+step > value.Pos_Y) && (tank.Y < value.Pos_Y+sideValue) && (tank.X+sideValue > value.Pos_X) && (tank.X < value.Pos_X+sideValue)) || (tank.Y+sideValue >= levelSide) {
// 				return false
// 			}
// 		}
// 	}

// 	if message == "3" {
// 		for _, value := range objects {
// 			if ((value.CanTPass == 0) && (tank.Y+sideValue > value.Pos_Y) && (tank.Y < value.Pos_Y+sideValue) && (tank.X+sideValue > value.Pos_X) && (tank.X < value.Pos_X+sideValue+step)) || (tank.X <= 0) {
// 				return false
// 			}
// 		}
// 	}

// 	if message == "4" {
// 		for _, value := range objects {
// 			if ((value.CanTPass == 0) && (tank.Y+sideValue > value.Pos_Y) && (tank.Y < value.Pos_Y+sideValue) && (tank.X+sideValue+step > value.Pos_X) && (tank.X < value.Pos_X+sideValue)) || (tank.X+sideValue >= levelSide) {
// 				return false
// 			}
// 		}
// 	}

// 	return true
// }

// Далее идут функции для редактора уровней
func createLevel(w http.ResponseWriter, r *http.Request) {
	ts, err := template.ParseFiles("pages/level_creator.html")
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

func saveLevel(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		reqData, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Error with data", 500)
			log.Println(err.Error())
			return
		}

		var req saveLevelRequest

		err = json.Unmarshal(reqData, &req)
		if err != nil {
			http.Error(w, "Error with level json", 500)
			log.Println(err.Error())
			return
		}

		err = insertLevelTodb(db, req)
		if err != nil {
			http.Error(w, "Error insert level", 500)
			log.Println(err.Error())
			return
		}

		err, levelID = getLastID(db)
		if err != nil {
			http.Error(w, "Error with ID", 500)
			log.Println(err.Error())
			return
		}
	}
}

func insertLevelTodb(db *sqlx.DB, req saveLevelRequest) error {
	const query = `
	INSERT INTO
	  level
	(
	  name,
	  side,
	  author
	)
	VALUES
	(
	  ?,
	  ?,
	  ?
	)
	`
	_, err := db.Exec(query, req.Name, req.Side, req.Author)
	return err
}

func getLastID(db *sqlx.DB) (error, int) {
	const query = `
	SELECT LAST_INSERT_ID()
	`

	row := db.QueryRow(query)
	newID := new(IDdata)
	err := row.Scan(&newID.ID)
	if err != nil {
		return err, 0
	}

	return nil, newID.ID
}

func saveObj(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		reqData, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Error with data", 500)
			log.Println(err.Error())
			return
		}

		var req saveCellRequest

		err = json.Unmarshal(reqData, &req)
		if err != nil {
			http.Error(w, "Error with cell json", 500)
			log.Println(err.Error())
			return
		}

		err = insertObjTodb(db, levelID, req)
		if err != nil {
			http.Error(w, "Error with inserting cell to db", 500)
			log.Println(err.Error())
			return
		}
	}
}

func insertObjTodb(db *sqlx.DB, levelID int, req saveCellRequest) error {
	const query = `
	INSERT INTO
	  level_obj
	(
	  id_level,
	  name,
	  is_Destructible,
	  can_T_pass,
	  can_B_pass,
	  imageURL,
	  pos_x,
	  pos_y
	)
	VALUES
	(
	  ?,
	  ?,
	  ?,
	  ?,
	  ?,
	  ?,
	  ?,
	  ?
	)
	`
	_, err := db.Exec(query, levelID, req.Name, req.Is_Destructible, req.CanTPass, req.CanBPass, req.Img_URL, req.Pos_x, req.Pos_y)
	return err
}
