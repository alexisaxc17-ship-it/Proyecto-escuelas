<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class School extends Model
{
    //Tabla real es 'school' (singular)
    protected $table = 'school';

    //Llave primaria real
    protected $primaryKey = 'id_school';

    //Si mi tabla NO tiene created_at/updated_at
    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'direccion',
        'email',
        'foto',
        'latitud',
        'longitud',
        'id_user',
    ];

    protected $casts = [
        'latitud' => 'float',
        'longitud' => 'float',
        'id_user' => 'integer',
    ];

    // Opcional: relación con User (si quiero usarla luego)
    public function user()
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }
}