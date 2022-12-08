import type {NextApiRequest, NextApiResponse} from "next";
import {conectarMongoDB} from "../../middlewares/conectarMongoDB";
import {politicaCORS} from "../../middlewares/politicaCORS";
import {validarTokenJWT} from "../../middlewares/validarTokenJWT";
import {UsuarioModel} from "../../models/UsuarioModel";
import type {RespostaPadraoMsg} from "../../types/RespostaPadraoMsg";

const pesquisaEndpoint = async (req : NextApiRequest, res : NextApiResponse<RespostaPadraoMsg | any[]>) => {
    try{
        if(req.method === 'GET'){
            if(req?.query?.id){
                const usuarioEncontrado = await UsuarioModel.findById(req?.query?.id);
                if(!usuarioEncontrado){
                    return res.status(400).json({erro : 'Usuario nao encontrado'});
                }
                return res.status(200).json(usuarioEncontrado);
            }else{
                const {filtro} = req.query;
                if(!filtro || filtro.length < 2){
                    return res.status(400).json({erro : 'Favor informar pelo menos 2 caracteres para busca'})
                }

                const usuariosEncontrados = await UsuarioModel.find({
                    $or : [{ nome : {$regex : filtro, $options : 'i'}},
                        //{ email : {$regex : filtro, $options : 'i'}}
                    ]
                });

                return res.status(200).json(usuariosEncontrados);
            }
        }
        return res.status(405).json({erro : 'Metodo informado invalido'})

    }catch(e){
        console.log(e);
        return res.status(500).json({erro : 'Nao foi possivel buscar usuarios' + e})
    }
}

export default politicaCORS(validarTokenJWT(conectarMongoDB(pesquisaEndpoint)));