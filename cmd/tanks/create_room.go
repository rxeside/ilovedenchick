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
	LevelID    int    `json:"Id"`
	LevelName  string `json:"Name"`
	MaxPlayers int    `json:"Max"`
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
			http.Error(w, "Err with request", 500)
			log.Println(err.Error())
			return
		}

		var req roomdatarequest

		err = json.Unmarshal(reqData, &req)
		if err != nil {
			http.Error(w, "Err with unmarshal", 500)
			log.Println(err.Error())
			return
		}

		levelID := req.LevelID
		levelName := req.LevelName
		MaxPlayers := req.MaxPlayers

		var NewRoom roomdata
		NewRoom.Name = levelName
		key := int(rand.Int31())
		NewRoom.Tanks = make(map[*websocket.Conn]*tanktype)
		NewRoom.Bullets = make(map[int]*bullettype)
		NewRoom.MaxPlayers = MaxPlayers

		NewRoom.Level, err = getLevelByID(db, levelID)
		if err != nil {
			http.Error(w, "Err with getting level", 500)
			log.Println(err.Error())
			return
		}

		NewRoom.Objects, err = getObjByID(db, levelID)
		if err != nil {
			http.Error(w, "Err with getting objects", 500)
			log.Println(err.Error())
			return
		}

		for index, value := range NewRoom.Objects {
			if value.Name == "Base" {
				NewRoom.Objects = append(NewRoom.Objects[:index], NewRoom.Objects[index+1:]...)
			}
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

		if len(NewRoom.PointsToSpawn) == 0 {
			var NewPos1 positionstruct
			NewPos1.X = float64((NewRoom.Level.Size-1)/2) * size
			NewPos1.Y = 0
			NewRoom.PointsToSpawn = append(NewRoom.PointsToSpawn, &NewPos1)

			for index, value := range NewRoom.Objects {
				if value.Pos_X == NewPos1.X && value.Pos_Y == NewPos1.Y {
					NewRoom.Objects = append(NewRoom.Objects[:index], NewRoom.Objects[index+1:]...)
				}
			}

			var NewPos2 positionstruct
			NewPos2.X = 0
			NewPos2.Y = float64((NewRoom.Level.Size-1)/2) * size
			NewRoom.PointsToSpawn = append(NewRoom.PointsToSpawn, &NewPos2)

			for index, value := range NewRoom.Objects {
				if value.Pos_X == NewPos2.X && value.Pos_Y == NewPos2.Y {
					NewRoom.Objects = append(NewRoom.Objects[:index], NewRoom.Objects[index+1:]...)
				}
			}

			var NewPos3 positionstruct
			NewPos3.X = float64((NewRoom.Level.Size-1)/2) * size
			NewPos3.Y = float64(NewRoom.Level.Size-1) * size
			NewRoom.PointsToSpawn = append(NewRoom.PointsToSpawn, &NewPos3)

			for index, value := range NewRoom.Objects {
				if value.Pos_X == NewPos3.X && value.Pos_Y == NewPos3.Y {
					NewRoom.Objects = append(NewRoom.Objects[:index], NewRoom.Objects[index+1:]...)
				}
			}

			var NewPos4 positionstruct
			NewPos4.X = float64(NewRoom.Level.Size-1) * size
			NewPos4.Y = float64((NewRoom.Level.Size-1)/2) * size
			NewRoom.PointsToSpawn = append(NewRoom.PointsToSpawn, &NewPos4)

			for index, value := range NewRoom.Objects {
				if value.Pos_X == NewPos4.X && value.Pos_Y == NewPos4.Y {
					NewRoom.Objects = append(NewRoom.Objects[:index], NewRoom.Objects[index+1:]...)
				}
			}
		}

		NewRoom.Status = "IdlePlayers"

		rooms[key] = &NewRoom
		fmt.Printf("key: %v\n", key)

		go func() {
			roomIsRunning(db, key)
		}()

		return
	}
}

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
