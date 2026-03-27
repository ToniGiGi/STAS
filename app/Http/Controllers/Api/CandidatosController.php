<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request; // <- Esto es vital para recibir los datos del JS
use Illuminate\Support\Facades\DB; // <- Para usar las consultas a la base de datos
use Illuminate\Support\Facades\Hash; // <- Para encriptar la contraseña de forma segura

class CandidatosController extends Controller
{
    // Función 1: Obtener todos los candidatos (La que ya teníamos)
    public function index()
    {
        $candidatos = DB::table('Usuarios')
            ->join('Roles', 'Usuarios.idRol', '=', 'Roles.id')
            ->leftJoin('PerfilesProfesionales', 'Usuarios.id', '=', 'PerfilesProfesionales.idUsuario')
            ->leftJoin('DepartamentosAreas', 'PerfilesProfesionales.idDepartamentoArea', '=', 'DepartamentosAreas.id')
            ->leftJoin('UsuarioCertificaciones', 'Usuarios.id', '=', 'UsuarioCertificaciones.idUsuario')
            ->leftJoin('CatCertificaciones', 'UsuarioCertificaciones.idCertificacion', '=', 'CatCertificaciones.id')
            ->whereIn('Roles.nombre', ['Candidato_Interno', 'Candidato_Externo'])
            ->groupBy(
                'Usuarios.id',
                'Usuarios.nombre',
                'Usuarios.ap',
                'PerfilesProfesionales.puestoActual',
                'DepartamentosAreas.nombre',
                'PerfilesProfesionales.antiguedadAnios'
            )
            ->select(
                'Usuarios.id',
                'Usuarios.nombre',
                'Usuarios.ap',
                'PerfilesProfesionales.puestoActual as puesto',
                DB::raw("IFNULL(DepartamentosAreas.nombre, 'General') as area"),
                DB::raw("IFNULL(PerfilesProfesionales.antiguedadAnios, 0) as exp"),
                DB::raw("IFNULL(GROUP_CONCAT(CatCertificaciones.nombre SEPARATOR ', '), 'Sin certificaciones') as certs"),
                DB::raw("(SELECT COUNT(*) FROM ResultadosSoftSkills WHERE ResultadosSoftSkills.idUsuario = Usuarios.id) as total_evaluaciones")
            )
            ->get();

        $candidatosFormateados = $candidatos->map(function($cand) {
            $certArr = explode(', ', $cand->certs);
            return [
                'id' => $cand->id,
                'nombre' => $cand->nombre . ' ' . $cand->ap,
                'puesto' => $cand->puesto ?? 'Ingeniero',
                'area' => $cand->area,
                'exp' => $cand->exp,
                'certs' => $cand->certs, 
                'estatus_evaluacion' => $cand->total_evaluaciones > 0 ? 'Evaluaciones Completadas' : 'Pendiente de Pruebas',
                'tag1' => $certArr[0] !== 'Sin certificaciones' ? $certArr[0] : 'STAS Pro',
                'tag2' => isset($certArr[1]) ? $certArr[1] : 'Automotriz',
                'foto' => null 
            ];
        });

        return response()->json([
            'exito' => true,
            'datos' => $candidatosFormateados
        ]);
    }

    // Función 2: Registrar un nuevo candidato desde el panel (La nueva)
    public function store(Request $request)
    {
        try {
            // 1. Insertamos en la tabla Usuarios
            $idUsuario = DB::table('Usuarios')->insertGetId([
                'nombre' => $request->nombre,
                'ap' => $request->ap,
                'am' => $request->am,
                'email' => $request->email,
                'contrasena' => Hash::make($request->contrasena), 
                'telefono' => $request->telefono,
                'idRol' => $request->idRol,
                'activo' => 1
            ]);

            // 2. Insertamos en Perfiles Profesionales
            DB::table('PerfilesProfesionales')->insert([
                'idUsuario' => $idUsuario,
                'idDepartamentoArea' => $request->idDepartamento,
                'puestoActual' => 'Nuevo Talento (App)',
                'antiguedadAnios' => 0,
                'nivelEstudios' => 'Por definir'
            ]);

            return response()->json([
                'exito' => true,
                'mensaje' => 'Usuario registrado correctamente en STAS'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'exito' => false,
                'error' => $e->getMessage() // Esto enviará el error exacto de SQL si algo falla
            ], 500);
        }
    }
}