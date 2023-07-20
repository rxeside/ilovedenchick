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
	LevelData []*levelsdata
}

type levelsdata struct {
	Id          int    `db:"id"`
	Name        string `db:"name"`
	Side        int    `db:"side"`
	Author      string `db:"author"`
	IsCompleted int    `db:"is_Completed"`
}

type obJects struct {
	Id              int    `db:"id"`
	Id_Level        int    `db:"id_level"`
	Name            string `db:"name"`
	Is_Destructible int    `db:"is_Destructible"`
	Can_T_Pass      int    `db:"can_T_pass"`
	Can_B_pass      int    `db:"can_B_pass"`
	ImageURL        string `db:"imageURL"`
	PosX            int    `db:"pos_x"`
	PosY            int    `db:"pos_y"`
}

func getLevelObj(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		levelNum, err := handleLevelID(w, r)
		// levelNum, err := ioutil.ReadAll(r.Body)
		if err != nil {
			// http.Error(w, "Error with data", 500)
			log.Println(err.Error())
			return
		}

		levelobjects, err := getObjByID(db, levelNum)
		if err != nil {
			// http.Error(w, "Error with data", 500)
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

// func numbersHandler(w http.ResponseWriter, r *http.Request) {
// 	numbers := []int{1, 2, 3, 4, 5}
// 	jsonNumbers, err := json.Marshal(numbers)
// 	if err != nil {
// 		// обработка ошибки
// 	}
// 	w.Header().Set("Content-Type", "application/json")
// 	w.Write(jsonNumbers)
// }

func handleLevelID(w http.ResponseWriter, r *http.Request) (int, error) {
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return 0, err
	}
	defer r.Body.Close()

	var number int
	err = json.Unmarshal(body, &number)
	if err != nil {
		http.Error(w, "Invalid number", http.StatusBadRequest)
		return 0, err
	}
	return number, nil
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

// func sendData(w http.ResponseWriter, data int, r *http.Request) {
// 	fmt.Fprintf(w, "%d", data)
// }

func levelsSelect(db *sqlx.DB) ([]*levelsdata, error) {
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

	var level []*levelsdata

	err := db.Select(&level, query)
	if err != nil {
		return nil, err
	}

	return level, nil

}
