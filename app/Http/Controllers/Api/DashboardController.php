<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function getKpis()
    {
        // 1. Contar Vacantes, Candidatos y Gráfica (Lo que ya tienes)
        $vacantesActivas = DB::table('Vacantes')->whereIn('idEstatusVacante', [1, 2])->count();
        $candidatosTotales = DB::table('Usuarios')->whereIn('idRol', [6, 7])->count();
        $tiempoPromedioCierre = "22 días"; 

        $reclutamiento = DB::table('Postulaciones')->whereIn('idEstatus', [1, 2, 3])->count();
        $entrevistas = DB::table('Postulaciones')->whereIn('idEstatus', [4, 5, 6])->count();
        $ofertas = DB::table('Postulaciones')->whereIn('idEstatus', [7, 8])->count();

        // 2. NUEVO: Obtener los últimos 3 test de Soft Skills realizados
        $actividadReciente = DB::table('ResultadosSoftSkills')
            ->join('Usuarios', 'ResultadosSoftSkills.idUsuario', '=', 'Usuarios.id')
            ->leftJoin('PerfilesProfesionales', 'Usuarios.id', '=', 'PerfilesProfesionales.idUsuario')
            ->join('TiposTest', 'ResultadosSoftSkills.idTipoTest', '=', 'TiposTest.id')
            ->select(
                'Usuarios.nombre',
                'Usuarios.ap',
                'PerfilesProfesionales.puestoActual',
                'TiposTest.nombre as test_nombre',
                'ResultadosSoftSkills.fechaRealizacion'
            )
            ->orderBy('ResultadosSoftSkills.fechaRealizacion', 'desc')
            ->limit(3)
            ->get();

        // 3. Devolver TODO en el JSON
        return response()->json([
            'exito' => true,
            'datos' => [
                'vacantes_activas' => $vacantesActivas,
                'candidatos_totales' => $candidatosTotales,
                'tiempo_cierre' => $tiempoPromedioCierre,
                'grafica_embudo' => [
                    ['Etapa', 'Candidatos'],
                    ['Reclutamiento', $reclutamiento],
                    ['Entrevista', $entrevistas],
                    ['Oferta', $ofertas]
                ],
                'actividad_reciente' => $actividadReciente // Agregamos la nueva consulta aquí
            ]
        ]);
    }
}