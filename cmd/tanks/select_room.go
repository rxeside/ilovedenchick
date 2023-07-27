package main

import (
	"log"
	"net/http"
	"text/template"
)

type selectRoomPage struct {
	Rooms []selectRoomBtn
}

type selectRoomBtn struct {
	Key  int
	Name string
}

func selectRoom(w http.ResponseWriter, r *http.Request) {
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
