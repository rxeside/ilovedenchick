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

type areadata struct {
	Cells []cellsdata
}

type cellsdata struct {
	ID   int
	Cell string
}

type leveldata struct {
	id     string `db:"id"`
	name   string `db:"name"`
	width  int    `db:"width"`
	height int    `db:"height"`
	key    string `db:"l_key"`
}

type objdata struct {
	Name           string `db:"name"`
	IsDestructible int    `db:"is_Destructible"`
	CanSkip        int    `db:"can_skip"`
	ImgURL         string `db:"imageURL"`
	Pos_X          int    `db:"pos_x"`
	Pos_Y          int    `db:"pos_y"`
}

var levelID int

type saveLevelRequest struct {
	Name   string `json:"name"`
	Wight  string `json:"wight"`
	Height string `json:"height"`
}

type saveCellRequest struct {
	Name            string `json:"name"`
	Is_Destructible int    `json:"isDestructible"`
	Can_Skip        int    `json:"canSkip"`
	Img_URL         string `json:"imgURL"`
	Pos_x           int    `json:"x"`
	Pos_y           int    `json:"y"`
}

type IDdata struct {
	ID int `db:"id"`
}

var objects []*objdata

func level(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		levelIDstr := mux.Vars(r)["levelID"]
		levelID, err := strconv.Atoi(levelIDstr)
		if err != nil {
			http.Error(w, "Err with levelID", 500)
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

func getObjByID(db *sqlx.DB, levelID int) ([]*objdata, error) {
	const query = `
			SELECT
			  name,
			  is_Destructible,
			  can_skip,
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
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	err = conn.WriteJSON(objects)
	if err != nil {
		log.Println(err)
		return
	}
}

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
	  width,
	  height
	)
	VALUES
	(
	  ?,
	  ?,
	  ?
	)
	`
	_, err := db.Exec(query, req.Name, req.Wight, req.Height)
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
	  can_skip,
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
	  ?
	)
	`
	_, err := db.Exec(query, levelID, req.Name, req.Is_Destructible, req.Can_Skip, req.Img_URL, req.Pos_x, req.Pos_y)
	return err
}
