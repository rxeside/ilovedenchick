package main

import (
	"html/template"
	"log"
	"net/http"
	"strconv"

	"github.com/jmoiron/sqlx"
)

const (
	max = 64
)

type areadata struct {
	Cells [max]cellsdata
}

type cellsdata struct {
	Cell string
}

type keydata struct {
	levelKey string `db:"level_key"`
}

type pathdata struct {
	sprite_path string `db:"sprite_path"`
}

func test(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		key, err := getkey(db)
		if err != nil {
			http.Error(w, "Error", 500)
			log.Println(err)
			return
		}

		ts, err := template.ParseFiles("pages/test.html")
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err)
			return
		}

		var Cells [max]cellsdata

		for i := 0; i < max; i++ {
			cell_Value, err := strconv.ParseInt(string(key[i]), 10, 64)
			if err != nil {
				return
			}

			NewCell := cellsdata{
				Cell: getPath(db, cell_Value),
			}

			Cells[i] = NewCell
		}

		date := areadata{
			Cells: Cells,
		}

		err = ts.Execute(w, date)
		if err != nil {
			http.Error(w, "Server Error", 500)
			log.Println(err.Error())
			return
		}
	}
}

func getkey(db *sqlx.DB) (string, error) {
	const query = `
	SELECT
	  level_key
	FROM
	  levels
	WHERE
	  level_id = 1
	`
	row := db.QueryRow(query)
	key := new(keydata)
	err := row.Scan(&key.levelKey)
	if err != nil {
		return "", err
	}

	return key.levelKey, err
}

func getPath(db *sqlx.DB, index int64) string {
	const query = `
	SELECT
	  sprite_path
	FROM
	  sprites
	WHERE
	  sprite_id = ?
	`

	row := db.QueryRow(query, index+1)
	path := new(pathdata)
	err := row.Scan(&path.sprite_path)

	if err != nil {
		return ""
	}

	return path.sprite_path
}
