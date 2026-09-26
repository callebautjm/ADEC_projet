/**
 * FONDU DI SALVEZZA ECONOMICA TERRITURIALE (« FONDS SALVEZZA »)
 * FONDS DE SAUVEGARDE ÉCONOMIQUE TERRITORIALE (« FONDS SALVEZZA »)
 * Collectivité de Corse
 * 
 * Liste officielle des 230 communes de Corse éligibles à la bonification de l'aide
 * du fonds SALVEZZA : Volets « Économique » et « Emploi »
 */

import { SalvezzaCommune } from '../types';

export const SALVEZZA_COMMUNES: SalvezzaCommune[] = [
  // Page 1 (33 communes)
  { nom: 'Aghione', nomCorse: 'Aghjone', codeCommune: '2B002', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: false },
  { nom: 'Aiti', nomCorse: 'Aiti', codeCommune: '2B003', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Alando', nomCorse: 'Alandu', codeCommune: '2B005', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Albertacce', nomCorse: 'Albertacce', codeCommune: '2B007', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Altagène', nomCorse: 'Altaghjè', codeCommune: '2A011', departement: '2A', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Altiani', nomCorse: 'Altiani', codeCommune: '2B012', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Alzi', nomCorse: "L'Alzi", codeCommune: '2B013', departement: '2B', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Ampriani', nomCorse: 'Ampriani', codeCommune: '2B015', departement: '2B', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Antisanti', nomCorse: 'Antisanti', codeCommune: '2B016', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Arbori', nomCorse: 'Arburi', codeCommune: '2A019', departement: '2A', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Argiusta-Moriccio', nomCorse: 'Arghjusta è Muricciu', codeCommune: '2A021', departement: '2A', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Arro', nomCorse: 'Arru', codeCommune: '2A022', departement: '2A', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Asco', nomCorse: 'Ascu', codeCommune: '2B023', departement: '2B', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Aullène', nomCorse: 'Auddè', codeCommune: '2A024', departement: '2A', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Avapessa', nomCorse: 'Avapessa', codeCommune: '2B025', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: false },
  { nom: 'Azzana', nomCorse: 'Azzana', codeCommune: '2A027', departement: '2A', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Balogna', nomCorse: 'Balogna', codeCommune: '2A028', departement: '2A', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Barrettali', nomCorse: 'Barrettali', codeCommune: '2B030', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: false },
  { nom: 'Bastelica', nomCorse: 'Bastelica', codeCommune: '2A031', departement: '2A', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Bigorno', nomCorse: 'Bigornu', codeCommune: '2B036', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Bilia', nomCorse: 'Bilia', codeCommune: '2A038', departement: '2A', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Bocognano', nomCorse: 'Bucugnà', codeCommune: '2A040', departement: '2A', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Bustanico', nomCorse: 'Bustanicu', codeCommune: '2B045', departement: '2B', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Cagnano', nomCorse: 'Cagnanu', codeCommune: '2B046', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: false },
  { nom: 'Calacuccia', nomCorse: 'Calacuccia', codeCommune: '2B047', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Calenzana', nomCorse: 'Calinzana', codeCommune: '2B049', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: false },
  { nom: 'Cambia', nomCorse: 'Cambia', codeCommune: '2B051', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Campana', nomCorse: 'A Campana', codeCommune: '2B052', departement: '2B', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Campi', nomCorse: 'Campi', codeCommune: '2B053', departement: '2B', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Campile', nomCorse: 'Campile', codeCommune: '2B054', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Campitello', nomCorse: 'Campitellu', codeCommune: '2B055', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Canari', nomCorse: 'Canari', codeCommune: '2B058', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: false },
  { nom: 'Canavaggia', nomCorse: 'Canavaghja', codeCommune: '2B059', departement: '2B', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },

  // Page 2 (43 communes)
  { nom: 'Carbini', nomCorse: 'Carbini', codeCommune: '2A061', departement: '2A', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Carbuccia', nomCorse: 'Carbuccia', codeCommune: '2A062', departement: '2A', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Carcheto-Brustico', nomCorse: 'Carchetu è Brusticu', codeCommune: '2B063', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Cargiaca', nomCorse: 'Carghjaca', codeCommune: '2A066', departement: '2A', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Carpineto', nomCorse: 'U Carpinetu', codeCommune: '2B067', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Carticasi', nomCorse: 'Carticasi', codeCommune: '2B068', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Casalabriva', nomCorse: 'Casalabriva', codeCommune: '2A071', departement: '2A', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Casalta', nomCorse: 'A Casalta', codeCommune: '2B072', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Casamaccioli', nomCorse: 'Casamacciuli', codeCommune: '2B073', departement: '2B', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Casanova', nomCorse: 'A Casanova', codeCommune: '2B074', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Casevecchie', nomCorse: 'E Casevechje', codeCommune: '2B075', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Castellare-di-Mercurio', nomCorse: 'U Castellà di Mercoriu', codeCommune: '2B078', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Castello-di-Rostino', nomCorse: 'Castellu di Rustinu', codeCommune: '2B079', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Castifao', nomCorse: 'Castifau', codeCommune: '2B080', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Castiglione', nomCorse: 'Castiglione', codeCommune: '2B081', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Castineta', nomCorse: 'Castineta', codeCommune: '2B082', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Castirla', nomCorse: 'Castirla', codeCommune: '2B083', departement: '2B', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Cateri', nomCorse: 'I Catari', codeCommune: '2B084', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: false },
  { nom: 'Chisa', nomCorse: 'Chisà', codeCommune: '2B366', departement: '2B', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Ciamannacce', nomCorse: 'Ciamanaccia', codeCommune: '2A089', departement: '2A', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Cognocoli-Monticchi', nomCorse: 'Cugnoculu è Muntichji', codeCommune: '2A091', departement: '2A', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Conca', nomCorse: 'Conca', codeCommune: '2A092', departement: '2A', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: false },
  { nom: 'Corrano', nomCorse: 'Currà', codeCommune: '2A094', departement: '2A', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Corscia', nomCorse: 'Corscia', codeCommune: '2B095', departement: '2B', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Cozzano', nomCorse: 'Cuzzà', codeCommune: '2A099', departement: '2A', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Cristinacce', nomCorse: 'E Cristinacce', codeCommune: '2A100', departement: '2A', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Croce', nomCorse: 'A Croce', codeCommune: '2B101', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Crocicchia', nomCorse: 'A Crucichja', codeCommune: '2B102', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Erbajolo', nomCorse: 'Erbaghjolu', codeCommune: '2B105', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Érone', nomCorse: 'Erone', codeCommune: '2B106', departement: '2B', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Évisa', nomCorse: 'Evisa', codeCommune: '2A108', departement: '2A', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Felce', nomCorse: 'Felce', codeCommune: '2B111', departement: '2B', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Feliceto', nomCorse: 'U Filicetu', codeCommune: '2B112', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Ficaja', nomCorse: 'Ficaghja', codeCommune: '2B113', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Foce', nomCorse: 'Foci è Bilzesi', codeCommune: '2A115', departement: '2A', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Focicchia', nomCorse: 'Fughjichja', codeCommune: '2B116', departement: '2B', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Forciolo', nomCorse: 'U Furciolu', codeCommune: '2A117', departement: '2A', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Fozzano', nomCorse: 'Fozzà', codeCommune: '2A118', departement: '2A', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Frasseto', nomCorse: 'Frassetu', codeCommune: '2A119', departement: '2A', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Galéria', nomCorse: 'Galeria', codeCommune: '2B121', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: false },
  { nom: 'Gavignano', nomCorse: 'Gavignanu', codeCommune: '2B122', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Ghisoni', nomCorse: 'Ghisoni', codeCommune: '2B124', departement: '2B', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Giocatojo', nomCorse: 'Ghjucatoghju', codeCommune: '2B125', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },

  // Page 3 (43 communes)
  { nom: 'Giuncaggio', nomCorse: 'Ghjuncaghju', codeCommune: '2B126', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Granace', nomCorse: 'Granaccia', codeCommune: '2A128', departement: '2A', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: false },
  { nom: 'Guagno', nomCorse: 'Guagnu', codeCommune: '2A131', departement: '2A', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Guargualé', nomCorse: 'Guargualè', codeCommune: '2A132', departement: '2A', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Guitera-les-Bains', nomCorse: 'A Vuttera', codeCommune: '2A133', departement: '2A', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Isolaccio-di-Fiumorbo', nomCorse: "L'Isulacciu di Fiumorbu", codeCommune: '2B135', departement: '2B', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'La Porta', nomCorse: 'A Porta', codeCommune: '2B246', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Lama', nomCorse: 'Lama', codeCommune: '2B136', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Lano', nomCorse: 'Lanu', codeCommune: '2B137', departement: '2B', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Lento', nomCorse: 'Lentu', codeCommune: '2B140', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Letia', nomCorse: 'Letia', codeCommune: '2A141', departement: '2A', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Levie', nomCorse: 'Livia', codeCommune: '2A142', departement: '2A', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Loreto-di-Casinca', nomCorse: 'Loretu di Casinca', codeCommune: '2B145', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Loreto-di-Tallano', nomCorse: "Laretu d'Attallà", codeCommune: '2A146', departement: '2A', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: false },
  { nom: 'Lozzi', nomCorse: 'Lozzi', codeCommune: '2B147', departement: '2B', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Lugo-di-Nazza', nomCorse: 'U Lugu di Nazza', codeCommune: '2B149', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Luri', nomCorse: 'Luri', codeCommune: '2B152', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: false },
  { nom: 'Manso', nomCorse: 'U Mansu', codeCommune: '2B153', departement: '2B', scoreContrainte: 'au dessus de 4', altitudeSup350m: false },
  { nom: 'Marignana', nomCorse: 'Marignana', codeCommune: '2A154', departement: '2A', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Matra', nomCorse: 'Matra', codeCommune: '2B155', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Mausoléo', nomCorse: 'U Musuleu', codeCommune: '2B156', departement: '2B', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Mazzola', nomCorse: 'A Mazzola', codeCommune: '2B157', departement: '2B', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Mela', nomCorse: 'Mela', codeCommune: '2A158', departement: '2A', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Meria', nomCorse: 'Meria', codeCommune: '2B159', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: false },
  { nom: 'Moca-Croce', nomCorse: 'Macà è Croci', codeCommune: '2A160', departement: '2A', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Moïta', nomCorse: 'Moita', codeCommune: '2B161', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Moltifao', nomCorse: 'Moltifau', codeCommune: '2B162', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Monacia-d\'Aullène', nomCorse: "A Munacia d'Auddè", codeCommune: '2A163', departement: '2A', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: false },
  { nom: 'Monacia-d\'Orezza', nomCorse: "A Munacia d'Orezza", codeCommune: '2B164', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Morsiglia', nomCorse: 'Mursiglia', codeCommune: '2B170', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: false },
  { nom: 'Muracciole', nomCorse: 'E Muracciole', codeCommune: '2B171', departement: '2B', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Muro', nomCorse: 'Muru', codeCommune: '2B173', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Murzo', nomCorse: 'Murzu', codeCommune: '2A174', departement: '2A', scoreContrainte: 'au dessus de 4', altitudeSup350m: false },
  { nom: 'Nessa', nomCorse: 'Nesce', codeCommune: '2B175', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Nocario', nomCorse: 'Nucariu', codeCommune: '2B176', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Noceta', nomCorse: 'Nuceta', codeCommune: '2B177', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Nonza', nomCorse: 'Nonza', codeCommune: '2B178', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: false },
  { nom: 'Novale', nomCorse: 'A Nuvale', codeCommune: '2B179', departement: '2B', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Novella', nomCorse: 'Nuvella', codeCommune: '2B180', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: false },
  { nom: 'Occhiatana', nomCorse: 'Ochjatana', codeCommune: '2B182', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Ogliastro', nomCorse: 'Ogliastru', codeCommune: '2B183', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: false },
  { nom: 'Olcani', nomCorse: 'Olcani', codeCommune: '2B184', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Olivese', nomCorse: 'Livesi', codeCommune: '2A186', departement: '2A', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },

  // Page 4 (43 communes)
  { nom: 'Olmeta-di-Capocorso', nomCorse: 'Olmeta di Capicorsu', codeCommune: '2B187', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: false },
  { nom: 'Olmi-Cappella', nomCorse: 'Olmi è Cappella', codeCommune: '2B190', departement: '2B', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Omessa', nomCorse: 'Omessa', codeCommune: '2B193', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Ortale', nomCorse: "L'Ortale", codeCommune: '2B194', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Ortiporio', nomCorse: 'Ortiporiu', codeCommune: '2B195', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Orto', nomCorse: 'Ortu', codeCommune: '2A196', departement: '2A', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Osani', nomCorse: 'Osani', codeCommune: '2A197', departement: '2A', scoreContrainte: 'au dessus de 4', altitudeSup350m: false },
  { nom: 'Ota', nomCorse: 'Ota', codeCommune: '2A198', departement: '2A', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: false },
  { nom: 'Palasca', nomCorse: 'Palasca', codeCommune: '2B199', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Palneca', nomCorse: 'Palleca', codeCommune: '2A200', departement: '2A', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Pancheraccia', nomCorse: 'A Pancheraccia', codeCommune: '2B201', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Parata', nomCorse: 'A Parata', codeCommune: '2B202', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Partinello', nomCorse: 'Partinellu', codeCommune: '2A203', departement: '2A', scoreContrainte: 'au dessus de 4', altitudeSup350m: false },
  { nom: 'Pastricciola', nomCorse: 'Pastricciola', codeCommune: '2A204', departement: '2A', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Penta-Acquatella', nomCorse: 'Penta è Acquatella', codeCommune: '2B206', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Perelli', nomCorse: 'I Pirelli', codeCommune: '2B208', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Pero-Casevecchie', nomCorse: 'Peru è Casevechje', codeCommune: '2B210', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Piana', nomCorse: 'A Piana', codeCommune: '2A212', departement: '2A', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Pianello', nomCorse: 'U Pianellu', codeCommune: '2B213', departement: '2B', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Piano', nomCorse: 'U Pianu', codeCommune: '2B214', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Piazzali', nomCorse: 'I Piazzali', codeCommune: '2B216', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Piazzole', nomCorse: 'E Piazzole', codeCommune: '2B217', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Piedicorte-di-Gaggio', nomCorse: 'Pedicorti di Caghju', codeCommune: '2B218', departement: '2B', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Piedicroce', nomCorse: 'Pedicroce', codeCommune: '2B219', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Piedipartino', nomCorse: 'U Pedipartinu', codeCommune: '2B221', departement: '2B', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Pie-d\'Orezza', nomCorse: "U Ped'Orezza", codeCommune: '2B222', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Pietra-di-Verde', nomCorse: 'A Petra di Verde', codeCommune: '2B225', departement: '2B', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Pietralba', nomCorse: 'Petralba', codeCommune: '2B223', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Pietraserena', nomCorse: 'Petraserena', codeCommune: '2B226', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Pietricaggio', nomCorse: 'U Petricaghju', codeCommune: '2B227', departement: '2B', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Pietroso', nomCorse: 'U Petrosu', codeCommune: '2B229', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Pino', nomCorse: 'Pinu', codeCommune: '2B233', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: false },
  { nom: 'Piobetta', nomCorse: 'Piupeta', codeCommune: '2B234', departement: '2B', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Pioggiola', nomCorse: 'Pioghjula', codeCommune: '2B235', departement: '2B', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Poggio-di-Nazza', nomCorse: 'U Poghju di Nazza', codeCommune: '2B236', departement: '2B', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Poggio-di-Venaco', nomCorse: 'U Poghju di Venacu', codeCommune: '2B238', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Poggiolo', nomCorse: 'U Pighjolu', codeCommune: '2A240', departement: '2A', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Poggio-Marinaccio', nomCorse: 'U Poghju Marinacciu', codeCommune: '2B241', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Polveroso', nomCorse: 'U Pulverosu', codeCommune: '2B243', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Popolasca', nomCorse: 'Upulasca', codeCommune: '2B244', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Porri', nomCorse: 'Porri', codeCommune: '2B245', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Prato-di-Giovellina', nomCorse: 'U Pratu di Ghjuvellina', codeCommune: '2B248', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Pruno', nomCorse: 'U Prunu', codeCommune: '2B252', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },

  // Page 5 (43 communes)
  { nom: 'Quasquara', nomCorse: 'Quasquara', codeCommune: '2A253', departement: '2A', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Quenza', nomCorse: 'Quenza', codeCommune: '2A254', departement: '2A', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Quercitello', nomCorse: 'U Quarcitellu', codeCommune: '2B255', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Rapaggio', nomCorse: 'Rapaghju', codeCommune: '2B256', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Renno', nomCorse: 'Rennu', codeCommune: '2A258', departement: '2A', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Rezza', nomCorse: 'Reza', codeCommune: '2A259', departement: '2A', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Riventosa', nomCorse: 'A Riventosa', codeCommune: '2B260', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Rosazia', nomCorse: 'Rusazia', codeCommune: '2A262', departement: '2A', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Rospigliani', nomCorse: 'Ruspigliani', codeCommune: '2B263', departement: '2B', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Rusio', nomCorse: 'Rusiu', codeCommune: '2B264', departement: '2B', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Salice', nomCorse: 'U salice', codeCommune: '2A266', departement: '2A', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Saliceto', nomCorse: 'U Salicetu', codeCommune: '2B267', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Sampolo', nomCorse: 'Sampolu', codeCommune: '2A268', departement: '2A', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'San-Damiano', nomCorse: 'San Damianu', codeCommune: '2B297', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'San-Gavino-d\'Ampugnani', nomCorse: 'San Gavinu d\'Ampugnani', codeCommune: '2B299', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'San-Gavino-di-Fiumorbo', nomCorse: 'San Gavinu di Fiumorbu', codeCommune: '2B365', departement: '2B', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'San-Gavino-di-Tenda', nomCorse: 'San Gavinu di Tenda', codeCommune: '2B301', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'San-Giovanni-di-Moriani', nomCorse: 'San Ghjuvanni di Moriani', codeCommune: '2B302', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'San-Lorenzo', nomCorse: 'San Lorenzu', codeCommune: '2B304', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Santa-Lucia-di-Mercurio', nomCorse: 'Santa Lucia di Mercoriu', codeCommune: '2B306', departement: '2B', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Santa-Maria-Figaniella', nomCorse: 'Santa Maria Ficaniedda', codeCommune: '2A310', departement: '2A', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Sant\'Andréa-di-Bozio', nomCorse: 'Sant\'Andria di Boziu', codeCommune: '2B292', departement: '2B', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Sant\'Andréa-d\'Orcino', nomCorse: 'Sant\'Andria d\'Urcinu', codeCommune: '2A295', departement: '2A', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: false },
  { nom: 'Santa-Reparata-di-Moriani', nomCorse: 'Santa Riparata di Moriani', codeCommune: '2B317', departement: '2B', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Santo-Pietro-di-Tenda', nomCorse: 'Santu Petru di Tenda', codeCommune: '2B314', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Santo-Pietro-di-Venaco', nomCorse: 'San Petru di Venacu', codeCommune: '2B315', departement: '2B', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Sari-Solenzara', nomCorse: 'Sari di Sulinzara', codeCommune: '2A269', departement: '2A', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: false },
  { nom: 'Scolca', nomCorse: 'Scolca', codeCommune: '2B274', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Sermano', nomCorse: 'Sermanu', codeCommune: '2B275', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Serra-di-Fiumorbo', nomCorse: 'Serra di Fiumorbu', codeCommune: '2B277', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Serra-di-Scopamène', nomCorse: 'A Sarra di Scupamena', codeCommune: '2A278', departement: '2A', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Serriera', nomCorse: 'A Sarrera', codeCommune: '2A279', departement: '2A', scoreContrainte: 'au dessus de 4', altitudeSup350m: false },
  { nom: 'Silvareccio', nomCorse: 'U Silvarecciu', codeCommune: '2B280', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Soccia', nomCorse: 'A Soccia', codeCommune: '2A282', departement: '2A', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Solaro', nomCorse: 'U Sulaghju', codeCommune: '2B283', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Sorbollano', nomCorse: 'Surbuddà', codeCommune: '2A285', departement: '2A', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Sorio', nomCorse: 'Soriu', codeCommune: '2B287', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Sotta', nomCorse: 'Sotta', codeCommune: '2A288', departement: '2A', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: false },
  { nom: 'Soveria', nomCorse: 'Suveria', codeCommune: '2B289', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Speloncato', nomCorse: 'U Spiluncatu', codeCommune: '2B290', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Stazzona', nomCorse: 'A Stazzona', codeCommune: '2B291', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Tallone', nomCorse: 'Tallone', codeCommune: '2B320', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Tarrano', nomCorse: 'Tarranu', codeCommune: '2B321', departement: '2B', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },

  // Page 6 (25 communes)
  { nom: 'Tasso', nomCorse: 'Tassu', codeCommune: '2A322', departement: '2A', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Tavera', nomCorse: 'Tavera', codeCommune: '2A324', departement: '2A', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Tolla', nomCorse: 'Todda', codeCommune: '2A326', departement: '2A', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Tox', nomCorse: 'Tocchisu', codeCommune: '2B328', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Tralonca', nomCorse: 'Tralonca', codeCommune: '2B329', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Ucciani', nomCorse: 'Aucciani', codeCommune: '2A330', departement: '2A', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Urtaca', nomCorse: 'Urtaca', codeCommune: '2B332', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Valle-d\'Alesani', nomCorse: 'E Valli d\'Alisgiani', codeCommune: '2B334', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Valle-di-Rostino', nomCorse: 'Valle di Rustinu', codeCommune: '2B337', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Valle-d\'Orezza', nomCorse: 'A Valle d\'Orezza', codeCommune: '2B338', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Vallica', nomCorse: 'A Vallica', codeCommune: '2B339', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Velone-Orneto', nomCorse: 'Vilone è Urnetu', codeCommune: '2B340', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: false },
  { nom: 'Venaco', nomCorse: 'Venacu', codeCommune: '2B341', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Vezzani', nomCorse: 'Vizzani', codeCommune: '2B347', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Ville-di-Paraso', nomCorse: 'E Ville di Parasu', codeCommune: '2B352', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Vivario', nomCorse: 'Vivariu', codeCommune: '2B354', departement: '2B', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Volpajola', nomCorse: 'A Vulpaiola', codeCommune: '2B355', departement: '2B', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Zalana', nomCorse: 'Zalana', codeCommune: '2B356', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Zérubia', nomCorse: 'Zirubia', codeCommune: '2A357', departement: '2A', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Zévaco', nomCorse: 'Zevacu', codeCommune: '2A358', departement: '2A', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Zicavo', nomCorse: 'Zicavu', codeCommune: '2A359', departement: '2A', scoreContrainte: 'au dessus de 4', altitudeSup350m: true },
  { nom: 'Zilia', nomCorse: 'Zilia', codeCommune: '2B361', departement: '2B', scoreContrainte: 'de 3,5 à 4', altitudeSup350m: true },
  { nom: 'Zonza', nomCorse: 'Zonza', codeCommune: '2A362', departement: '2A', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: true },
  { nom: 'Zoza', nomCorse: 'Zoza', codeCommune: '2A363', departement: '2A', scoreContrainte: 'de 3 à 3,5', altitudeSup350m: false },
  { nom: 'Zuani', nomCorse: 'Zuani', codeCommune: '2B364', departement: '2B', scoreContrainte: 'au dessus de 4', altitudeSup350m: true }
];

/**
 * Recherche une commune par code INSEE ou nom (français ou corse)
 */
export function normalizeCommuneName(str: string): string {
  return (str || '')
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

/**
 * Recherche une commune par code INSEE (ex: 2B002, 2A011)
 * Utilise en priorité le code commune présent dans la liste officielle des 230 communes.
 */
export function findSalvezzaCommuneByCode(code: string | undefined): SalvezzaCommune | undefined {
  if (!code) return undefined;
  const clean = code.trim().toUpperCase().replace(/\s+/g, '');
  if (!clean) return undefined;

  // 1. Correspondance exacte directe sur codeCommune (ex: 2B002, 2A011, 2B218)
  const exact = SALVEZZA_COMMUNES.find((c) => c.codeCommune.toUpperCase() === clean);
  if (exact) return exact;

  // 2. Gestion de la notation numérique 20xxx (ex: 20011 -> 2A011 ou 20002 -> 2B002)
  if (clean.length === 5 && clean.startsWith('20')) {
    const suffix = clean.slice(2);
    return SALVEZZA_COMMUNES.find((c) => c.codeCommune.slice(2) === suffix);
  }

  return undefined;
}

/**
 * Recherche une commune par nom exact (français ou corse)
 * Strictement exact après normalisation des accents et séparateurs pour éviter toute fausse correspondance
 */
export function findSalvezzaCommuneByName(name: string | undefined): SalvezzaCommune | undefined {
  if (!name) return undefined;
  const normalized = normalizeCommuneName(name);
  if (!normalized) return undefined;

  return SALVEZZA_COMMUNES.find((c) => {
    const normNom = normalizeCommuneName(c.nom);
    const normCorse = normalizeCommuneName(c.nomCorse);
    return normNom === normalized || normCorse === normalized;
  });
}

/**
 * Recherche flexible avec filtrage multiple
 */
export function searchSalvezzaCommunes(
  query: string,
  filters?: {
    departement?: 'ALL' | '2A' | '2B';
    scoreContrainte?: 'ALL' | 'de 3 à 3,5' | 'de 3,5 à 4' | 'au dessus de 4';
    altitudeOnly?: boolean;
  }
): SalvezzaCommune[] {
  let list = SALVEZZA_COMMUNES;

  if (filters?.departement && filters.departement !== 'ALL') {
    list = list.filter((c) => c.departement === filters.departement);
  }

  if (filters?.scoreContrainte && filters.scoreContrainte !== 'ALL') {
    list = list.filter((c) => c.scoreContrainte === filters.scoreContrainte);
  }

  if (filters?.altitudeOnly) {
    list = list.filter((c) => c.altitudeSup350m);
  }

  if (!query || query.trim() === '') {
    return list;
  }

  const q = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  return list.filter((c) => {
    const n = c.nom.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const nc = c.nomCorse.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const code = c.codeCommune.toLowerCase();
    return n.includes(q) || nc.includes(q) || code.includes(q);
  });
}

/**
 * Statistiques officielles du Fonds SALVEZZA
 */
export const SALVEZZA_STATS = {
  totalCommunes: SALVEZZA_COMMUNES.length,
  communes2A: SALVEZZA_COMMUNES.filter((c) => c.departement === '2A').length,
  communes2B: SALVEZZA_COMMUNES.filter((c) => c.departement === '2B').length,
  chefsLieuxAltitudeSup350m: SALVEZZA_COMMUNES.filter((c) => c.altitudeSup350m).length,
  contrainteSevereSup4: SALVEZZA_COMMUNES.filter((c) => c.scoreContrainte === 'au dessus de 4').length,
  contrainteMoyenne35a4: SALVEZZA_COMMUNES.filter((c) => c.scoreContrainte === 'de 3,5 à 4').length,
  contrainteBase3a35: SALVEZZA_COMMUNES.filter((c) => c.scoreContrainte === 'de 3 à 3,5').length
};
