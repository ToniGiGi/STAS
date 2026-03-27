<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VacantesController extends Controller
{
    public function getActivas()
    {
        // Consultamos la tabla Vacantes filtrando por estatus abierto
        $vacantes = DB::table('Vacantes')
            ->whereIn('idEstatusVacante', [1, 2])
            ->select('id', 'titulo', 'idEstatusVacante')
            ->orderBy('id', 'asc') // Ordenamos por las más antiguas primero
            ->get();

        return response()->json([
            'exito' => true,
            'datos' => $vacantes
        ]);
    }
    public function getCandidatosTop($idVacante)
    {
        // 1. Consulta SQL Real con JOINs a tu estructura normalizada
        $candidatos = DB::table('Postulaciones')
            ->join('Usuarios', 'Postulaciones.idUsuario', '=', 'Usuarios.id')
            // Hacemos JOIN con Perfiles para sacar el puesto y la experiencia
            ->leftJoin('PerfilesProfesionales', 'Usuarios.id', '=', 'PerfilesProfesionales.idUsuario')
            // Hacemos JOIN doble para sacar los nombres de las certificaciones
            ->leftJoin('UsuarioCertificaciones', 'Usuarios.id', '=', 'UsuarioCertificaciones.idUsuario')
            ->leftJoin('CatCertificaciones', 'UsuarioCertificaciones.idCertificacion', '=', 'CatCertificaciones.id')
            ->where('Postulaciones.idVacante', $idVacante)
            // Agrupamos porque un usuario puede tener muchas certificaciones
            ->groupBy(
                'Usuarios.id',
                'Usuarios.nombre',
                'Usuarios.ap',
                'PerfilesProfesionales.puestoActual',
                'PerfilesProfesionales.antiguedadAnios',
                'Postulaciones.porcentajeCompatibilidad'
            )
            ->orderBy('Postulaciones.porcentajeCompatibilidad', 'desc')
            ->limit(3)
            ->select(
                'Usuarios.id', 
                'Usuarios.nombre', 
                'Usuarios.ap', 
                'PerfilesProfesionales.puestoActual',
                'PerfilesProfesionales.antiguedadAnios as exp',
                // Magia SQL: Junta todas las certificaciones en un solo texto separado por comas
                DB::raw("IFNULL(GROUP_CONCAT(CatCertificaciones.nombre SEPARATOR ', '), 'Ninguna') as certs"),
                'Postulaciones.porcentajeCompatibilidad as compatibilidad'
            )
            ->get();

        // 2. Mapeo de datos: Como no tenemos los "scores" del radar en la BD, 
        // los calculamos matemáticamente basados en su compatibilidad real para que la gráfica no se rompa.
        $candidatosFormateados = $candidatos->map(function ($candidato) {
            $base = $candidato->compatibilidad;
            $experiencia = $candidato->exp ? $candidato->exp : 0;
            
            return [
                'id' => $candidato->id,
                'nombre' => $candidato->nombre,
                'ap' => $candidato->ap,
                'puestoActual' => $candidato->puestoActual,
                'exp' => $candidato->exp,
                'certs' => $candidato->certs,
                'compatibilidad' => $candidato->compatibilidad,
                
                // Generamos los 6 picos del radar con variaciones leves alrededor de su score base
                'score_tecnica' => min(100, $base + rand(-5, 5)),
                'score_blandas' => min(100, $base + rand(-8, 8)),
                'score_exp' => min(100, ($experiencia * 10) + 20), // Ej: 5 años = 70%
                'score_certs' => $candidato->certs !== 'Ninguna' ? min(100, $base + 5) : 40,
                'score_cultura' => min(100, $base + rand(-5, 5)),
                'score_liderazgo' => min(100, $base + rand(-10, 10)),
            ];
        });

        return response()->json([
            'exito' => true,
            'datos' => $candidatosFormateados
        ]);
    }

     
}