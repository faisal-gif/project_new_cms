<?php

namespace App\Enum;

enum WriterBerbayarType: int
{
    case AJP = 1;
    case DJ = 2;
    case KT = 4;

    // Method pembantu untuk mendapatkan nilai string/label
    public function label(): string
    {
        return match ($this) {
            self::AJP => 'AJP',
            self::DJ => 'DJ',
            self::KT => 'KT',
        };
    }
}
