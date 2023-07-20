package main

import (
	"encoding/json"
	"fmt"
	"html/template"
	"io"
	"log"
	"math/rand"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/jmoiron/sqlx"
)

type roomdatarequest struct {
	LevelID int `json:"Id"`
}

type roomdeletenum struct {
	ID int `json:"ID"`
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

func createRoomPage(w http.ResponseWriter, r *http.Request) {
	ts, err := template.ParseFiles("pages/room_creator.html")
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

func createNewRoom(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		reqData, err := io.ReadAll(r.Body)
		if err != nil {
			log.Println(err.Error())
			return
		}

		var req roomdatarequest

		err = json.Unmarshal(reqData, &req)
		if err != nil {
			log.Println(err.Error())
			return
		}

		levelID := req.LevelID

		var NewRoom roomdata
		NewRoom.LastID = 0
		// NewRoom.ID = int(rand.Int31())
		key := int(rand.Int31())
		NewRoom.Tanks = make(map[*websocket.Conn]*tanktype)
		NewRoom.Bullets = make(map[int]*bullettype)

		NewRoom.Level, err = getLevelByID(db, levelID)
		if err != nil {
			log.Println(err.Error())
			return
		}

		NewRoom.Objects, err = getObjByID(db, levelID)
		if err != nil {
			log.Println(err.Error())
			return
		}
		NewRoom.Status = "IdlePlayers"

		rooms[key] = &NewRoom
		fmt.Printf("key: %v\n", key)

		roomIsRunning(key)

		return
	}
}

// Нужно будет пересмотреть, перед удалением нужно будет завершить ту функцию на функционирование комнаты
func deleteRoom(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Delete")
	reqData, err := io.ReadAll(r.Body)
	if err != nil {
		log.Println(err.Error())
		return
	}

	var roomDelete roomdeletenum

	err = json.Unmarshal(reqData, &roomDelete)
	if err != nil {
		log.Println(err.Error())
		return
	}

	roomId := roomDelete.ID
	fmt.Println(roomId)

	rooms[roomId].Status = "Remove"
	// roomIndex := -1

	// for index, value := range rooms {
	// 	if value.ID == roomId {
	// 		roomIndex = index
	// 	}
	// }

	// if roomIndex != -1 {
	// 	if len(rooms) == 1 {
	// 		rooms = nil
	// 		fmt.Println("Nil")
	// 	} else {

	// 		if roomIndex+1 > len(rooms) {
	// 			fmt.Println("Overflow")
	// 		} else {
	// 			fmt.Println("Cut")
	// 			rooms = append(rooms[:roomIndex], rooms[roomIndex+1:]...)
	// 		}
	// 	}
	// }

	log.Printf("%q\n", rooms)
	return
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
