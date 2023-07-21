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
