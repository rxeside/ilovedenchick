package main

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"text/template"

	"github.com/jmoiron/sqlx"
)

type selectRoomPage struct {
	Rooms []selectRoomBtn
}

type selectRoomBtn struct {
	Key  int
	Name string
	Size int
}

func selectRoom(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		err := checkCookie(db, w, r)
		if err != nil {
			log.Println(err.Error())
			http.Redirect(w, r, "/enter_to_battle", http.StatusSeeOther)
			return
		}

		ts, err := template.ParseFiles("pages/room_select.html")
		if err != nil {
			http.Error(w, "Error with page", 500)
			log.Println(err.Error())
			return
		}

		var linkOfRooms []selectRoomBtn

		for key, room := range rooms {
			var point selectRoomBtn
			point.Key = key
			point.Name = room.Name
			point.Size = room.Level.Side

			linkOfRooms = append(linkOfRooms, point)
		}

		data := selectRoomPage{
			Rooms: linkOfRooms,
		}

		err = ts.Execute(w, data)
		if err != nil {
			http.Error(w, "Error with execute", 500)
			log.Println(err.Error())
			return
		}
	}
}

func getObjFromRoom(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		body, err := ioutil.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Error with getting body", 500)
			log.Println(err.Error())
			return
		}

		var roomKey int

		err = json.Unmarshal(body, &roomKey)
		if err != nil {
			http.Error(w, "Error with json umarshal", 500)
			log.Println(err.Error())
			return
		}

		Objects, err := getObjByID(db, rooms[roomKey].Level.Id)
		if err != nil {
			http.Error(w, "Err with getting objects", 500)
			log.Println(err.Error())
			return
		}

		jsonData, err := json.Marshal(Objects)
		if err != nil {
			http.Error(w, "Error with marshal json", 500)
			log.Println(err.Error())
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.Write(jsonData)

		return
	}
}
