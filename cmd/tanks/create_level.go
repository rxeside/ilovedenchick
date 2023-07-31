package main

import (
	"encoding/json"
	"html/template"
	"io"
	"log"
	"net/http"

	"github.com/jmoiron/sqlx"
)

type IDdata struct {
	ID int `db:"id"`
}

type saveLevelRequest struct {
	Name   string `json:"name"`
	Side   string `json:"side"`
	Author string `json:"author"`
}

type saveCellRequest struct {
	LevelID         int    `json:"levelId"`
	Name            string `json:"name"`
	Is_Destructible int    `json:"isDestructible"`
	CanTPass        int    `json:"canTpass"`
	CanBPass        int    `json:"canBpass"`
	Img_URL         string `json:"imgURL"`
	Pos_x           int    `json:"x"`
	Pos_y           int    `json:"y"`
}

func createLevel(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		err := checkCookie(db, w, r)
		if err != nil {
			log.Println(err.Error())
			http.Redirect(w, r, "/enter_to_battle", http.StatusSeeOther)
			return
		}

		ts, err := template.ParseFiles("pages/level_creator.html")
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

func saveLevel(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		reqData, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Error with data", 500)
			log.Println(err.Error())
			return
		}

		var req saveLevelRequest

		err = json.Unmarshal(reqData, &req)
		if err != nil {
			http.Error(w, "Error with level json", 500)
			log.Println(err.Error())
			return
		}

		err = insertLevelTodb(db, req)
		if err != nil {
			http.Error(w, "Error insert level", 500)
			log.Println(err.Error())
			return
		}

		err, levelID := getLastID(db)
		if err != nil {
			http.Error(w, "Error with ID", 500)
			log.Println(err.Error())
			return
		}

		jsonData, err := json.Marshal(levelID)
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

func insertLevelTodb(db *sqlx.DB, req saveLevelRequest) error {
	const query = `
	INSERT INTO
	  level
	(
	  name,
	  side,
	  author
	)
	VALUES
	(
	  ?,
	  ?,
	  ?
	)
	`
	_, err := db.Exec(query, req.Name, req.Side, req.Author)
	return err
}

func getLastID(db *sqlx.DB) (error, int) {
	const query = `
	SELECT LAST_INSERT_ID()
	`

	row := db.QueryRow(query)
	newID := new(IDdata)
	err := row.Scan(&newID.ID)
	if err != nil {
		return err, 0
	}

	return nil, newID.ID
}

func saveObj(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		err, lastID := getLastID(db)
		if err != nil {
			http.Error(w, "Err with lasrID", 500)
			log.Println(err.Error())
			return
		}

		reqData, err := io.ReadAll(r.Body)
		if err != nil {
			_ = deleteLevel(db, lastID)
			http.Error(w, "Error with data", 500)
			log.Println(err.Error())
			return
		}

		var req []saveCellRequest

		err = json.Unmarshal(reqData, &req)
		if err != nil {
			_ = deleteLevel(db, lastID)
			http.Error(w, "Error with cell json", 500)
			log.Println(err.Error())
			return
		}

		for _, value := range req {
			err = insertObjTodb(db, value)
			if err != nil {
				_ = deleteLevel(db, lastID)
				http.Error(w, "Error with inserting cell to db", 500)
				log.Println(err.Error())
				return
			}
		}

		return
	}
}

func insertObjTodb(db *sqlx.DB, obj saveCellRequest) error {
	const query = `
	INSERT INTO
	  level_obj
	(
	  id_level,
	  name,
	  is_Destructible,
	  can_T_pass,
	  can_B_pass,
	  imageURL,
	  pos_x,
	  pos_y
	)
	VALUES
	(
	  ?,
	  ?,
	  ?,
	  ?,
	  ?,
	  ?,
	  ?,
	  ?
	)
	`
	_, err := db.Exec(query, obj.LevelID, obj.Name, obj.Is_Destructible, obj.CanTPass, obj.CanBPass, obj.Img_URL, obj.Pos_x, obj.Pos_y)
	return err
}

func deleteLevel(db *sqlx.DB, levelId int) error {
	const query = `
			DELETE FROM
			  level
			WHERE
			 id = ?
	`

	_, err := db.Exec(query, levelId)
	if err != nil {
		return err
	}

	return nil
}
