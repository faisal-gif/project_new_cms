<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class EKoranController extends Controller
{
    public function index()
    {
        return inertia('Admin/Nasional/Ekoran/Index');
    }

    public function create()
    {
        return inertia('Admin/Nasional/Ekoran/Create');
    }
}
