<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Padre extends Model
{
    protected $table = 'padres';
    protected $primaryKey = 'id_padre';
    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'direccion',
        'telefono'
    ];

    public function alumnos()
    {
        return $this->belongsToMany(
            Alumno::class,
            'padres_alumnos', // tabla pivote
            'id_padre',       // clave foránea padre
            'id_alumno'       // clave foránea alumno
        )->withPivot('parentesco');
    }
}