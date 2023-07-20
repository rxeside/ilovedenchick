package main

import (
	"html/template"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"github.com/jmoiron/sqlx"
)

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
		}
	}
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
