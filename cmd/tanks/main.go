package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"

	"github.com/go-sql-driver/mysql"
	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
	"github.com/jmoiron/sqlx"
)

const (
	port         = ":3000"
	dbDriverName = "mysql"
)

func main() {
	cfg := mysql.Config{
		User:   "root",
		Passwd: "P@ssw0rd",
		Net:    "tcp",
		Addr:   "localhost:3306",
		DBName: "tanks",
	}

	db, err := sql.Open("mysql", cfg.FormatDSN())
	if err != nil {
		log.Fatal(err)
	}

	dbx := sqlx.NewDb(db, dbDriverName)

	mux := mux.NewRouter()
	mux.HandleFunc("/ws", handler)

	mux.HandleFunc("/level/{levelID}", level(dbx))
	mux.HandleFunc("/create_level", createLevel)

	mux.HandleFunc("/api/save_level", saveLevel(dbx)).Methods(http.MethodPost)
	mux.HandleFunc("/api/save_obj", saveObj(dbx)).Methods(http.MethodPost)

	mux.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir("./static"))))

	fmt.Println("Start server " + port)
	err = http.ListenAndServe(port, mux)
	if err != nil {
		log.Fatal(err)
	}
}
