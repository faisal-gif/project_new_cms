<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class NewsKTRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'is_code'     => 'sometimes|string',
            'editor_id'   => 'required|integer',
            'datepub'    => 'sometimes',
            'title'       => 'required|string|max:255',
            'content'     => 'required|string',
            'description' => 'required|string',
            'tags'        => 'required|array', // Asumsi frontend mengirim array dari InputTag
            'caption'     => 'nullable|string',
            'headline'    => 'sometimes|boolean',
            'city'        => 'required|string',
            'type'        => 'sometimes|integer',
            'status'      => 'sometimes|integer',
        ];
    }
}
