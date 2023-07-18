package main

import (
	"html/template"
	"log"
	"net/http"
)

func mainMenu(w http.ResponseWriter, r *http.Request) {
	ts, err := template.ParseFiles("pages/main_menu.html")
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
