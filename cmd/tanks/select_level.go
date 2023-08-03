package main

import (
	"encoding/json"
	"html/template"
	"io/ioutil"
	"log"
	"net/http"

	"github.com/jmoiron/sqlx"
)

type selectLevelPage struct {
	LevelData []*leveldata
}

func getLevelObj(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		levelNum, err := handleLevelID(w, r)
		if err != nil {
			log.Println(err.Error())
			return
		}

		levelobjects, err := getObjByID(db, levelNum)
		if err != nil {
			log.Println(err.Error())
			return
		}

		jsonData, err := json.Marshal(levelobjects)
		if err != nil {
			log.Println(err.Error())
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.Write(jsonData)

		return
	}
}

func handleLevelID(w http.ResponseWriter, r *http.Request) (int, error) {
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return 0, err
	}
	defer r.Body.Close()

	var numStr int
	err = json.Unmarshal(body, &numStr)
	if err != nil {
		http.Error(w, "Invalid number", http.StatusBadRequest)
		return 0, err
	}

	return numStr, nil
}

func selectLevel(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		levels, err := levelsSelect(db)
		if err != nil {
			http.Error(w, "Error", 500)
			log.Println(err)
			return
		}

		ts, err := template.ParseFiles("pages/select_level.html")
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

func levelsSelect(db *sqlx.DB) ([]*leveldata, error) {
	const query = `
		SELECT
		  id,
		  name,
		  side,
		  author,
		  is_Completed
		FROM
		  level
	`

	var level []*leveldata

	err := db.Select(&level, query)
	if err != nil {
		return nil, err
	}

	return level, nil

}
