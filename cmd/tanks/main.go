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
		DBName: "tanki_online",
	}

	db, err := sql.Open("mysql", cfg.FormatDSN())
	if err != nil {
		log.Fatal(err)
	}

	dbx := sqlx.NewDb(db, dbDriverName)

	mux := mux.NewRouter()

	mux.HandleFunc("/ws/{roomKey}", wsConnection(dbx))

	mux.HandleFunc("/level/{levelID}", levelPage(dbx))
	mux.HandleFunc("/room/{roomKey}", roomPage(dbx))
	mux.HandleFunc("/create_level", createLevel(dbx))
	mux.HandleFunc("/main", mainMenu(dbx))
	mux.HandleFunc("/create_room", createRoomPage(dbx))
	mux.HandleFunc("/select_level", selectLevel(dbx))
	mux.HandleFunc("/select_room", selectRoom(dbx))
	mux.HandleFunc("/enter_to_battle", enterToBattlePage)
	mux.HandleFunc("/r", deleteCookie)

	mux.HandleFunc("/api/save_level", saveLevel(dbx)).Methods(http.MethodPost)
	mux.HandleFunc("/api/save_obj", saveObj(dbx)).Methods(http.MethodPost)
	mux.HandleFunc("/api/create_new_room", createNewRoom(dbx)).Methods(http.MethodPost)
	mux.HandleFunc("/api/delete_room", deleteRoom).Methods(http.MethodPost)
	mux.HandleFunc("/api/getlevel", getLevel(dbx)).Methods((http.MethodPost))
	mux.HandleFunc("/api/getlevelobj", getLevelObj(dbx)).Methods((http.MethodPost))
	mux.HandleFunc("/api/getobjfromroom", getObjFromRoom(dbx)).Methods((http.MethodPost))
	mux.HandleFunc("/api/login", getUser(dbx)).Methods(http.MethodPost)
	mux.HandleFunc("/api/register", saveUser(dbx)).Methods(http.MethodPost)

	mux.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir("./static"))))

	fmt.Println("Start server " + port)
	err = http.ListenAndServe(port, mux)
	if err != nil {
		log.Fatal(err)
	}
}
