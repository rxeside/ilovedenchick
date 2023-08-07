package main

import (
	"log"
	"net/http"
	"time"

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

	_, err = searchUserOnDB(db, userID)
	if err != nil {
		return err
	}

	return nil
}

func searchUserOnDB(db *sqlx.DB, ID string) (userdata, error) {
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
		return userdata{}, err
	}

	return *user, nil
}

func deleteCookie(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:    "UserCookie",
		Path:    "/",
		Expires: time.Now().AddDate(0, 0, -1),
	})
}
