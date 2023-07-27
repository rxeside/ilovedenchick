package main

import (
	"log"
	"net/http"
	"text/template"
)

type selectRoomdata struct {
	Rooms map[int]*roomdata
}

func selectRoom(w http.ResponseWriter, r *http.Request) {
	ts, err := template.ParseFiles("pages/room_select.html")
	if err != nil {
		http.Error(w, "Error with page", 500)
		log.Println(err.Error())
		return
	}

	data := selectRoomdata{
		Rooms: rooms,
	}

	err = ts.Execute(w, data)
	if err != nil {
		http.Error(w, "Error with execute", 500)
		log.Println(err.Error())
		return
	}
}
