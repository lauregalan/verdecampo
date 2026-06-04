<?php

namespace App\Services;

use Illuminate\Support\Str;
use Spatie\SimpleExcel\SimpleExcelWriter;

class SimpleExcelExportService
{
    public function download(object $export, string $filename)
    {
        $directory = storage_path('app/exports');

        if (! is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        $path = $directory.'/'.Str::uuid().'-'.$filename;

        $writer = SimpleExcelWriter::create($path);
        $writer->addHeader($export->headings());
        $writer->addRows($export->rows());
        $writer->close();

        return response()
            ->download($path, $filename, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ])
            ->deleteFileAfterSend();
    }
}
