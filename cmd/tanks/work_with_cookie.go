package main

import (
	"log"
	"net/http"

	"github.com/jmoiron/sqlx"
)

func checkCookie(db *sqlx.DB, w http.ResponseWriter, r *http.Request) error {
	cookie, err := r.Cookie("UserCookie")
	if err != nil {
		if err == http.ErrNoCookie {
			return err
		}

		log.Println(err.Error())
		return err
	}

	userID := cookie.Value

	err = searchUserOnDB(db, userID)
	if err != nil {
		return err
	}

	return nil
}

func searchUserOnDB(db *sqlx.DB, ID string) error {
	const query = `
			SELECT
			  id,
			  nickname,
			  level_complited
			FROM
			  user
			WHERE
			  id = ?
	`
	row := db.QueryRow(query, ID)
	user := new(userdata)
	err := row.Scan(&user.ID, &user.NickName, &user.LevelComplited)
	if err != nil {
		return err
	}

	return nil
}
