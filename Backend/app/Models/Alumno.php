<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Alumno extends Model
{
    protected $table = 'alumnos';
    protected $primaryKey = 'id_alumno';
    public $timestamps = false;

    protected $fillable = [
        'nombre_completo',
        'direccion',
        'telefono',
        'email',
        'foto',
        'genero',
        'latitud',
        'longitud',
        'id_grado',
        'id_seccion',
        'id_school'
    ];

    public function school()
    {
        return $this->belongsTo(School::class, 'id_school', 'id_school');
    }

    public function padres()
    {
        return $this->belongsToMany(
            Padre::class,
            'padres_alumnos',
            'id_alumno',
            'id_padre'
        )->withPivot('parentesco');
    }
}