import type {NextApiRequest, NextApiResponse} from "next";
import {conectarMongoDB} from "../../middlewares/conectarMongoDB";
import {politicaCORS} from "../../middlewares/politicaCORS";
import {validarTokenJWT} from "../../middlewares/validarTokenJWT";
import {PublicacaoModel} from "../../models/PublicacaoModel";
import {UsuarioModel} from "../../models/UsuarioModel";
import type {RespostaPadraoMsg} from "../../types/RespostaPadraoMsg";

const likeEndpoint = async (req : NextApiRequest, res : NextApiResponse<RespostaPadraoMsg>) => {
    
    try{
        if(req.method === 'PUT'){
            
            //id da publicacao
            const {id} = req?.query;
            const publicacao = await PublicacaoModel.findById(id);
            if(!publicacao){
                return res.status(400).json({erro : 'Publicacao nao encontrada'});
            }

            //id do usuario que esta curtindo a publicacao
            const {userId} = req?.query;
            const usuario = await UsuarioModel.findById(userId);
            if(!usuario){
                return res.status(400).json({erro : 'Usuario nao encontrado'});
            }

            //verificar se a foto ja foi curtida por este usuario
            const indexDoUsuarioNoLike = publicacao.likes.findIndex((e : any) => e.toString() === usuario._id.toString());

            //se o index for > -1 sinal que ele ja curtiu a foto
            if(indexDoUsuarioNoLike != -1){
                publicacao.likes.splice(indexDoUsuarioNoLike, 1);
                await PublicacaoModel.findByIdAndUpdate({_id : publicacao._id}, publicacao);
                return res.status(200).json({msg : 'Publicacao descurtida com sucesso'});
            }else{
                //se o index for -1 sinal que ele nao curtiu a foto
                publicacao.likes.push(usuario._id);
                await PublicacaoModel.findByIdAndUpdate({_id : publicacao._id}, publicacao);
                return res.status(200).json({msg : 'Publicacao curtida com sucesso'});
            }
        }
        return res.status(405).json({erro : 'Metodo informado invalido'});
    }catch(e){
        console.log(e);
        return res.status(500).json({erro : 'Ocorreu um erro ao curtir a publicacao'});
    }
}

export default politicaCORS(validarTokenJWT(conectarMongoDB(likeEndpoint)));