<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PanelController extends Controller
{
    public function index()
    {
        return view('panel.inicio');
    }

    // Nuevo método para la vista de vacantes
    public function vacantes()
    {
        return view('panel.vacantes');
    }
    public function nuevaVacante()
    {
        return view('panel.nueva-vacante');
    }
public function candidatos()
    {
        return view('panel.candidatos');
    }

    public function perfilCandidato()
    {
        return view('panel.perfil-candidato');
    }

    public function crearPerfil()
    {
        return view('panel.crear-perfil');
    }
    // Nuevo método para Catálogo de Pruebas
    public function catalogo()
    {
        return view('panel.catalogo');
    }
    public function configuracion()
    {
        return view('panel.configuracion');
    }
}
