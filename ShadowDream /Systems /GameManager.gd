extends Node

var money = 0
var rep = 1
var energy = 100
var wanted_level = 0

func add_money(v):
    money += v

func add_rep(v):
    rep += v

func use_energy(v):
    energy = max(0, energy - v)

func add_wanted(v):
    wanted_level = clamp(wanted_level + v, 0, 5)

func clear_wanted():
    wanted_level = 0
