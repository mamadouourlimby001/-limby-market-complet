import { useState, useCallback } from 'react';
import { View, Text, TextInput, Image, Pressable, Alert, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ChevronUp, ChevronDown, Trash2, Plus } from 'lucide-react-native';

import api from '../../services/api';
import Screen from '../../components/Screen';
import { Button, Loader } from '../../components/ui';
import { colors } from '../../theme/theme';

export default function OrganiserBoutiqueScreen() {
  const [boutiqueId, setBoutiqueId] = useState(null);
  const [sections, setSections] = useState([]);
  const [unassigned, setUnassigned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [addingSection, setAddingSection] = useState(false);

  useFocusEffect(useCallback(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get('/boutiques/my-boutique');
        const { boutique, products } = res.data;
        setBoutiqueId(boutique._id);
        const orderedSections = (boutique.sections || []).sort((a, b) => (a.ordre || 0) - (b.ordre || 0));
        const built = orderedSections.map(s => ({
          nom: s.nom,
          produits: products
            .filter(p => p.section === s.nom)
            .sort((a, b) => (a.ordre || 0) - (b.ordre || 0)),
        }));
        setSections(built);
        setUnassigned(products.filter(p => !p.section).sort((a, b) => (a.ordre || 0) - (b.ordre || 0)));
      } catch (err) {
        Alert.alert('Erreur', 'Impossible de charger la boutique');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []));

  const save = async () => {
    setSaving(true);
    try {
      const sectionsData = sections.map((s, i) => ({ nom: s.nom, ordre: i }));
      const produits = [];
      sections.forEach(s => {
        s.produits.forEach((p, pi) => produits.push({ _id: p._id, section: s.nom, ordre: pi }));
      });
      unassigned.forEach((p, pi) => produits.push({ _id: p._id, section: null, ordre: pi }));
      await api.put(`/boutiques/${boutiqueId}/organisation`, { sections: sectionsData, produits });
      Alert.alert('', 'Organisation sauvegardée !');
    } catch (err) {
      Alert.alert('Erreur', 'Sauvegarde échouée');
    } finally {
      setSaving(false);
    }
  };

  const confirmAddSection = () => {
    const nom = newSectionName.trim();
    if (!nom) return;
    setSections(prev => [...prev, { nom, produits: [] }]);
    setNewSectionName('');
    setAddingSection(false);
  };

  const renameSection = (idx, newNom) => {
    setSections(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], nom: newNom };
      return next;
    });
  };

  const deleteSection = (idx) => {
    Alert.alert('Supprimer la section', `Supprimer "${sections[idx].nom}" ? Les produits seront sans section.`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => {
        setSections(prev => {
          const next = [...prev];
          const removed = next.splice(idx, 1)[0];
          setUnassigned(u => [...u, ...removed.produits]);
          return next;
        });
      }},
    ]);
  };

  const moveSection = (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= sections.length) return;
    setSections(prev => {
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const moveProduitInSection = (sectionIdx, produitIdx, dir) => {
    const target = produitIdx + dir;
    if (target < 0 || target >= sections[sectionIdx].produits.length) return;
    setSections(prev => {
      const next = prev.map(s => ({ ...s, produits: [...s.produits] }));
      [next[sectionIdx].produits[produitIdx], next[sectionIdx].produits[target]] =
        [next[sectionIdx].produits[target], next[sectionIdx].produits[produitIdx]];
      return next;
    });
  };

  const moveUnassigned = (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= unassigned.length) return;
    setUnassigned(prev => {
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const moveProduitToSection = (produit, fromSectionIdx) => {
    const choices = sections
      .map((s, i) => ({ text: s.nom, i }))
      .filter((_, i) => i !== fromSectionIdx);
    Alert.alert('Déplacer vers', null, [
      ...choices.map(c => ({
        text: c.text,
        onPress: () => {
          setSections(prev => {
            const next = prev.map(s => ({ ...s, produits: [...s.produits] }));
            next[fromSectionIdx].produits = next[fromSectionIdx].produits.filter(p => p._id !== produit._id);
            next[c.i].produits.push(produit);
            return next;
          });
        },
      })),
      {
        text: 'Sans section',
        onPress: () => {
          setSections(prev => {
            const next = prev.map(s => ({ ...s, produits: [...s.produits] }));
            next[fromSectionIdx].produits = next[fromSectionIdx].produits.filter(p => p._id !== produit._id);
            return next;
          });
          setUnassigned(prev => [...prev, produit]);
        },
      },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const assignToSection = (produit, unassignedIdx) => {
    if (sections.length === 0) {
      Alert.alert('', 'Créez d\'abord une section.');
      return;
    }
    Alert.alert('Ajouter à la section', null, [
      ...sections.map((s, i) => ({
        text: s.nom,
        onPress: () => {
          setUnassigned(prev => prev.filter((_, idx) => idx !== unassignedIdx));
          setSections(prev => {
            const next = prev.map(s2 => ({ ...s2, produits: [...s2.produits] }));
            next[i].produits.push(produit);
            return next;
          });
        },
      })),
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  if (loading) return <Loader fullScreen />;

  return (
    <Screen>
      <View style={styles.topBar}>
        <Text style={styles.pageTitle}>Organiser les produits</Text>
        <Button title={saving ? 'Enreg...' : 'Enregistrer'} onPress={save} />
      </View>

      {addingSection ? (
        <View style={styles.addSectionRow}>
          <TextInput
            style={styles.addSectionInput}
            value={newSectionName}
            onChangeText={setNewSectionName}
            placeholder="Nom de la section..."
            autoFocus
          />
          <Pressable style={styles.confirmBtn} onPress={confirmAddSection}>
            <Text style={styles.confirmBtnText}>OK</Text>
          </Pressable>
          <Pressable style={styles.cancelBtnSmall} onPress={() => { setAddingSection(false); setNewSectionName(''); }}>
            <Text style={styles.cancelBtnText}>X</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable style={styles.addSectionBtn} onPress={() => setAddingSection(true)}>
          <Plus size={16} color={colors.primary} />
          <Text style={styles.addSectionBtnText}>Ajouter une section</Text>
        </Pressable>
      )}

      {sections.map((section, sIdx) => (
        <View key={sIdx} style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <TextInput
              style={styles.sectionNameInput}
              value={section.nom}
              onChangeText={v => renameSection(sIdx, v)}
            />
            <Pressable onPress={() => deleteSection(sIdx)} style={styles.deleteSectionBtn}>
              <Trash2 size={16} color="#ef4444" />
            </Pressable>
          </View>
          <View style={styles.sectionMoveRow}>
            <Pressable
              style={[styles.sectionMoveBtn, sIdx === 0 && styles.sectionMoveBtnDisabled]}
              onPress={() => moveSection(sIdx, -1)}
              disabled={sIdx === 0}
            >
              <ChevronUp size={14} color={sIdx === 0 ? '#ccc' : colors.primary} />
              <Text style={[styles.sectionMoveTxt, sIdx === 0 && { color: '#ccc' }]}>Monter section</Text>
            </Pressable>
            <Pressable
              style={[styles.sectionMoveBtn, sIdx === sections.length - 1 && styles.sectionMoveBtnDisabled]}
              onPress={() => moveSection(sIdx, 1)}
              disabled={sIdx === sections.length - 1}
            >
              <ChevronDown size={14} color={sIdx === sections.length - 1 ? '#ccc' : colors.primary} />
              <Text style={[styles.sectionMoveTxt, sIdx === sections.length - 1 && { color: '#ccc' }]}>Descendre section</Text>
            </Pressable>
          </View>

          {section.produits.length === 0 && (
            <Text style={styles.emptySection}>Aucun produit dans cette section</Text>
          )}

          {section.produits.map((produit, pIdx) => (
            <View key={produit._id} style={styles.produitRow}>
              {produit.photos?.[0]
                ? <Image source={{ uri: produit.photos[0] }} style={styles.produitThumb} />
                : <View style={[styles.produitThumb, { backgroundColor: '#f0f0f0' }]} />
              }
              <Text style={styles.produitNom} numberOfLines={1}>{produit.titre}</Text>
              <View style={styles.produitActions}>
                <Pressable onPress={() => moveProduitInSection(sIdx, pIdx, -1)} disabled={pIdx === 0}>
                  <ChevronUp size={18} color={pIdx === 0 ? '#ccc' : '#333'} />
                </Pressable>
                <Pressable onPress={() => moveProduitInSection(sIdx, pIdx, 1)} disabled={pIdx === section.produits.length - 1}>
                  <ChevronDown size={18} color={pIdx === section.produits.length - 1 ? '#ccc' : '#333'} />
                </Pressable>
                <Pressable style={styles.moveBtn} onPress={() => moveProduitToSection(produit, sIdx)}>
                  <Text style={styles.moveBtnText}>Déplacer</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      ))}

      {unassigned.length > 0 && (
        <View style={styles.sectionBlock}>
          <Text style={styles.unassignedTitle}>Produits sans section ({unassigned.length})</Text>
          {unassigned.map((produit, pIdx) => (
            <View key={produit._id} style={styles.produitRow}>
              {produit.photos?.[0]
                ? <Image source={{ uri: produit.photos[0] }} style={styles.produitThumb} />
                : <View style={[styles.produitThumb, { backgroundColor: '#f0f0f0' }]} />
              }
              <Text style={styles.produitNom} numberOfLines={1}>{produit.titre}</Text>
              <View style={styles.produitActions}>
                <Pressable onPress={() => moveUnassigned(pIdx, -1)} disabled={pIdx === 0}>
                  <ChevronUp size={18} color={pIdx === 0 ? '#ccc' : '#333'} />
                </Pressable>
                <Pressable onPress={() => moveUnassigned(pIdx, 1)} disabled={pIdx === unassigned.length - 1}>
                  <ChevronDown size={18} color={pIdx === unassigned.length - 1 ? '#ccc' : '#333'} />
                </Pressable>
                {sections.length > 0 && (
                  <Pressable style={styles.moveBtn} onPress={() => assignToSection(produit, pIdx)}>
                    <Text style={styles.moveBtnText}>→ Section</Text>
                  </Pressable>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {sections.length === 0 && unassigned.length === 0 && (
        <Text style={styles.emptyAll}>Aucun produit. Ajoutez des produits à votre boutique.</Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  pageTitle: { fontSize: 15, fontWeight: '700', color: colors.primary },
  addSectionRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  addSectionInput: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8, fontSize: 14 },
  confirmBtn: { backgroundColor: colors.primary, borderRadius: 6, paddingHorizontal: 14, justifyContent: 'center' },
  confirmBtnText: { color: '#fff', fontWeight: '700' },
  cancelBtnSmall: { backgroundColor: '#ef4444', borderRadius: 6, paddingHorizontal: 12, justifyContent: 'center' },
  cancelBtnText: { color: '#fff', fontWeight: '700' },
  addSectionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, borderWidth: 1.5, borderColor: colors.primary, borderStyle: 'dashed', borderRadius: 8, marginBottom: 14 },
  addSectionBtnText: { color: colors.primary, fontWeight: '600' },
  sectionBlock: { backgroundColor: '#fff', borderRadius: 10, padding: 10, marginBottom: 12, borderWidth: 1, borderColor: colors.border || '#e5e7eb' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  sectionNameInput: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.primary, borderBottomWidth: 1, borderBottomColor: colors.primary, paddingBottom: 2 },
  deleteSectionBtn: { padding: 4 },
  sectionMoveRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  sectionMoveBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, borderWidth: 1, borderColor: colors.primary, borderRadius: 6, paddingVertical: 4, paddingHorizontal: 8 },
  sectionMoveBtnDisabled: { borderColor: '#e5e7eb' },
  sectionMoveTxt: { fontSize: 11, fontWeight: '600', color: colors.primary },
  emptySection: { fontSize: 12, color: '#9ca3af', textAlign: 'center', paddingVertical: 8 },
  produitRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#f5f5f5' },
  produitThumb: { width: 40, height: 40, borderRadius: 4 },
  produitNom: { flex: 1, fontSize: 12, color: '#333' },
  produitActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  moveBtn: { backgroundColor: colors.primary, borderRadius: 4, paddingVertical: 4, paddingHorizontal: 7 },
  moveBtnText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  unassignedTitle: { fontSize: 13, fontWeight: '700', color: '#9ca3af', marginBottom: 6 },
  emptyAll: { textAlign: 'center', color: '#9ca3af', paddingVertical: 30, fontSize: 13 },
});
