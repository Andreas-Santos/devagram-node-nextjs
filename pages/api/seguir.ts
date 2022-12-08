import type {NextApiRequest, NextApiResponse} from 'next';
import {conectarMongoDB} from '../../middlewares/conectarMongoDB';
import {politicaCORS} from '../../middlewares/politicaCORS';
import {validarTokenJWT} from '../../middlewares/validarTokenJWT';
import {SeguidorModel} from '../../models/SeguidorModel';
import {UsuarioModel} from '../../models/UsuarioModel';
import type {RespostaPadraoMsg} from '../../types/RespostaPadraoMsg';

const endpointSeguir = async (req : NextApiRequest, res : NextApiResponse<RespostaPadraoMsg>) => {
    try{
        if(req.method === 'PUT'){
            
            const {userId, id} = req?.query;
            
            //usuario autenticado = quem esta fazendo as acoes
            const usuarioLogado = await UsuarioModel.findById(userId);
            if(!usuarioLogado){
                return res.status(400).json({erro : 'Usuario logado nao encontrado'});
            }

            //id do usuario a ser seguido - query
            const usuarioASerSeguido = await UsuarioModel.findById(id);
            if(!usuarioASerSeguido){
                return res.status(400).json({erro : 'Usuario a ser seguido nao encontrado'});
            }

            //buscar se o Usuario logado ja segue ou nao esse usuario
            const euJaSigoEsseUsuario = await SeguidorModel
                .find({usuarioId : usuarioLogado._id, usuarioSeguidoId : usuarioASerSeguido._id});
            if(euJaSigoEsseUsuario && euJaSigoEsseUsuario.length > 0){
                //sinal que ja sigo este usuario
                euJaSigoEsseUsuario.forEach(async(e : any) => await SeguidorModel.findByIdAndDelete({_id : e._id}));

                //o usuario logado esta deixando de seguir um usuario
                //logo o numero de seguindo dele deve diminuir
                usuarioLogado.seguindo--; //operador de decremento
                await UsuarioModel.findByIdAndUpdate({_id : usuarioLogado._id}, usuarioLogado);

                //o usuario seguido deixou de ser seguido por um usuario
                //logo o numero de seguidores dele deve diminuir
                usuarioASerSeguido.seguidores--; //operador de decremento
                await UsuarioModel.findByIdAndUpdate({_id : usuarioASerSeguido._id}, usuarioASerSeguido);

                return res.status(200).json({msg : 'Usuario deixado de seguir com sucesso'});
            }else{
                //sinal que ainda nao sigo esse usuario
                const seguidor = {
                    usuarioId : usuarioLogado._id,
                    usuarioSeguidoId : usuarioASerSeguido._id
                };
                await SeguidorModel.create(seguidor);

                //o usuario logado esta seguindo um novo usuario
                //logo o numero de seguindo dele deve aumentar
                usuarioLogado.seguindo++; //operador de incremento
                await UsuarioModel.findByIdAndUpdate({_id : usuarioLogado._id}, usuarioLogado);

                //o usuario seguido esta sendo seguido por um novo usuario
                //logo o numero de seguidores dele deve aumentar
                usuarioASerSeguido.seguidores++; //operador de incremento
                await UsuarioModel.findByIdAndUpdate({_id : usuarioASerSeguido._id}, usuarioASerSeguido);

                return res.status(200).json({msg : 'Usuario seguido com sucesso'});
            }

        }

        return res.status(405).json({erro : 'Metodo informado nao e valido'});
    }catch(e){
        console.log(e)
        return res.status(500).json({erro : 'Nao foi possivel seguir/deseguir o usuario informado'});
    }
}

export default politicaCORS(validarTokenJWT(conectarMongoDB(endpointSeguir)));