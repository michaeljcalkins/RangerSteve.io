<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Input;
use App\Http\Requests;

class HomeController extends Controller
{
    public function welcome() {
        return view('welcome');
    }

    public function game(Request $req) {
        $data = [
            'user_id' => $req->get('user_id')
        ];

        return view('game', compact('data'));
    }
}
