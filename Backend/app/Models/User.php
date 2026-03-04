<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    protected $table = 'usuarios';
    protected $primaryKey = 'id_user';
    public $timestamps = false;

    protected $fillable = ['nombre', 'usuario', 'password', 'tipo'];
    protected $hidden = ['password'];

    public function getAuthPassword()
    {
        return $this->password;
    }
}