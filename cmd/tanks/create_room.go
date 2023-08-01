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
	LevelID   int    `json:"Id"`
	LevelName string `json:"Name"`
}

type roomdeletenum struct {
	ID int `json:"ID"`
}

type leveldata struct {
	Id          int    `db:"id"`
	Name        string `db:"name"`
	Size        int    `db:"side"`
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

func createRoomPage(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		err := checkCookie(db, w, r)
		if err != nil {
			log.Println(err.Error())
			http.Redirect(w, r, "/enter_to_battle", http.StatusSeeOther)
			return
		}

		levels, err := levelsSelect(db)
		if err != nil {
			http.Error(w, "Error", 500)
			log.Println(err)
			return
		}

		ts, err := template.ParseFiles("pages/room_creator.html")
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err)
			return
		}

		data := selectLevelPage{
			LevelData: levels,
		}

		err = ts.Execute(w, data)
		if err != nil {
			http.Error(w, "Server Error", 500)
			log.Println(err.Error())
			return
		}
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
		levelName := req.LevelName

		var NewRoom roomdata
		NewRoom.Name = levelName
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

		for _, value := range NewRoom.Objects {
			value.Pos_X = value.Pos_X * size
			value.Pos_Y = value.Pos_Y * size
			if value.Name == "Tank" {
				var NewPos positionstruct
				NewPos.X = value.Pos_X
				NewPos.Y = value.Pos_Y

				NewRoom.PointsToSpawn = append(NewRoom.PointsToSpawn, &NewPos)
			}
		}

		NewRoom.Status = "IdlePlayers"

		rooms[key] = &NewRoom
		fmt.Printf("key: %v\n", key)

		roomIsRunning(db, key)

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
