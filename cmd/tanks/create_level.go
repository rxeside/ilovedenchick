package main

import (
	"encoding/json"
	"html/template"
	"io"
	"log"
	"net/http"

	"github.com/jmoiron/sqlx"
)

var levelID int

type IDdata struct {
	ID int `db:"id"`
}

type saveLevelRequest struct {
	Name   string `json:"name"`
	Side   string `json:"side"`
	Author string `json:"author"`
}

type saveCellRequest struct {
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

		err, levelID = getLastID(db)
		if err != nil {
			http.Error(w, "Error with ID", 500)
			log.Println(err.Error())
			return
		}
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
		reqData, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Error with data", 500)
			log.Println(err.Error())
			return
		}

		var req saveCellRequest

		err = json.Unmarshal(reqData, &req)
		if err != nil {
			http.Error(w, "Error with cell json", 500)
			log.Println(err.Error())
			return
		}

		err = insertObjTodb(db, levelID, req)
		if err != nil {
			http.Error(w, "Error with inserting cell to db", 500)
			log.Println(err.Error())
			return
		}
	}
}

func insertObjTodb(db *sqlx.DB, levelID int, req saveCellRequest) error {
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
	_, err := db.Exec(query, levelID, req.Name, req.Is_Destructible, req.CanTPass, req.CanBPass, req.Img_URL, req.Pos_x, req.Pos_y)
	return err
}
