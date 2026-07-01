<?php

namespace App\Http\Controllers;

use App\Models\PageStatic;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PageStaticController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = PageStatic::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('page_name', 'like', "%{$request->search}%");
            });
        }

        $pageStatics = $query->select('page_id', 'page_name', 'page_desk')
            ->orderBy('page_id', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Nasional/PageStatic/Index', [
            'pageStatics' => $pageStatics,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(PageStatic $pageStatic)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PageStatic $pageStatic)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PageStatic $pageStatic)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PageStatic $pageStatic)
    {
        //
    }
}
