package main

import (
	"encoding/json"
	"html/template"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/jmoiron/sqlx"
)

type levelPagedata struct {
	LevelID   int
	LevelSize int
}

func levelPage(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		levelIDstr := mux.Vars(r)["levelID"]
		levelID, err := strconv.Atoi(levelIDstr)
		if err != nil {
			http.Error(w, "Err with levelID", 500)
			log.Println(err.Error())
		}

		currLevel, err := getLevelByID(db, levelID)
		if err != nil {
			http.Error(w, "Error with getting a level by ID", 500)
			log.Println(err.Error())
		}

		ts, err := template.ParseFiles("pages/level.html")
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err.Error())
			return
		}

		data := levelPagedata{
			LevelID: currLevel.Id,
		}

		err = ts.Execute(w, data)
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err.Error())
			return
		}
	}
}

func getLevel(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		levelID, err := handleLevelID(w, r)
		if err != nil {
			http.Error(w, "Err with getting levelID", 500)
			log.Println(err.Error())
			return
		}

		level, err := getLevelByID(db, levelID)
		if err != nil {
			http.Error(w, "Err with getting level", 500)
			log.Println(err.Error())
			return
		}

		jsonData, err := json.Marshal(level)
		if err != nil {
			http.Error(w, "Err with json marshal", 500)
			log.Println(err.Error())
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.Write(jsonData)
	}
}
