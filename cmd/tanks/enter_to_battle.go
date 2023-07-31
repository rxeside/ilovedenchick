package main

import (
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"html/template"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/jmoiron/sqlx"
)

type userRequestdata struct {
	NickName string `json:"NickName"`
	Email    string `json:"Email"`
	Password string `json:"Pass"`
}

type userdata struct {
	ID             int
	NickName       string
	LevelComplited int
}

func enterToBattlePage(w http.ResponseWriter, r *http.Request) {
	ts, err := template.ParseFiles("pages/enter_to_battle.html")
	if err != nil {
		http.Error(w, "Error with page", 500)
		log.Println(err.Error())
		return
	}

	err = ts.Execute(w, nil)
	if err != nil {
		http.Error(w, "Error with page", 500)
		log.Println(err.Error())
		return
	}

	return
}

func getUser(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		reqData, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Err with request", 500)
			log.Println(err.Error())
			return
		}

		var req userRequestdata

		err = json.Unmarshal(reqData, &req)
		if err != nil {
			http.Error(w, "Err with unmarhal", 500)
			log.Println(err.Error())
			return
		}

		hash := md5.Sum([]byte(req.Password))
		req.Password = hex.EncodeToString(hash[:])
		fmt.Printf("req.Password: %v\n", req.Password)

		user, err := getUserFromDB(db, req)
		if err != nil {
			http.Error(w, "Err with getting from date base", 500)
			log.Println(err.Error())
			return
		}

		http.SetCookie(w, &http.Cookie{
			Name:     "UserCookie",
			Value:    fmt.Sprint(user.ID),
			HttpOnly: true,
			Path:     "/",
			Expires:  time.Now().AddDate(0, 0, 1),
		})

		cook, err := r.Cookie("UserCookie")
		if err != nil {
			log.Println(err.Error())
			return
		}

		fmt.Printf("cook: %v\n", cook)

		return
	}
}

func saveUser(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		reqData, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Err with request", 500)
			log.Println(err.Error())
			return
		}

		var newUser userRequestdata

		err = json.Unmarshal(reqData, &newUser)
		if err != nil {
			http.Error(w, "Err with unmarshal", 500)
			log.Println(err.Error())
			return
		}

		hash := md5.Sum([]byte(newUser.Password))
		newUser.Password = hex.EncodeToString(hash[:])

		err = createUserOnDB(db, newUser)
		if err != nil {
			http.Error(w, "Err with save user", 500)
			log.Println(err.Error())
			return
		}

		return
	}
}

func getUserFromDB(db *sqlx.DB, data userRequestdata) (userdata, error) {
	const query = `
			SELECT
			  id,
			  nickname,
			  level_complited
			FROM 
			  user
			WHERE
			  email = ? AND
			  password = ?
	`
	row := db.QueryRow(query, data.Email, data.Password)
	user := new(userdata)
	err := row.Scan(&user.ID, &user.NickName, &user.LevelComplited)
	if err != nil {
		return userdata{}, err
	}

	return *user, nil
}

func createUserOnDB(db *sqlx.DB, user userRequestdata) error {
	const query = `
			INSERT INTO 
			  user
			(
			  nickname,
			  email,
			  password
			)
			VALUES
			(
			  ?,
			  ?,
			  ?
			)
	`
	_, err := db.Exec(query, user.NickName, user.Email, user.Password)

	return err
}
