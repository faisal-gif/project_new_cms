<?php

namespace App\Http\Controllers;

use App\Http\Requests\AJPRequest;
use App\Models\AJP;
use App\Models\NewsNasional;
use App\Models\WriterBerbayar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AJPController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/AJP/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(AJPRequest $request)
    {

        $apiUrl = "https://ajp.times.co.id/api/news/show/" . $request->id;

        $response = Http::get($apiUrl);

        $duplicate =  NewsNasional::where('news_title', $response['data']['title'])->first();

        if ($duplicate != null) {
            return back()->with('error', 'News Sudah Pernah Di Export');
        }

        $data = $response->json();


        $newsExport = NewsNasional::create([
            'is_code' => $data['data']['is_code'],
            'news_image_new' => '',
            'news_writer' =>  $data['data']['writer'],
            'news_datepub' => $data['data']['datetime'],
            'news_title' => $data['data']['title'],
            'news_caption' => Str::limit($data['data']['caption'], 250),
            'news_content' => $data['data']['content'],
            'news_city' => $data['data']['city'],
            'created_by' => $request->publisher,
            'news_status' => '2',
        ]);

        return back()->with('success', 'News export successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(AJP $aJP)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(AJP $aJP)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, AJP $aJP)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AJP $aJP)
    {
        //
    }
}
