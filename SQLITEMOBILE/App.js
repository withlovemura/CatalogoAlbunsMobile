import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  Banco,
  countAlbuns,
  createTable,
  deleteAlbum,
  insertAlbum,
  selectAlbuns,
  updateAlbum,
} from './Banco/Config';

const emptyForm = { titulo: '', artista: '', ano: '', genero: '', capa: '' };

async function refreshAlbums(db, requestedPage) {
  const totalAlbums = await countAlbuns(db);
  const totalPages = Math.max(1, Math.ceil(totalAlbums / 4));
  const currentPage = Math.min(Math.max(requestedPage, 1), totalPages);
  const albums = await selectAlbuns(db, currentPage, 4);
  return { albums, totalAlbums, totalPages, currentPage };
}

function AlbumArtwork({ uri, year, style, label }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [uri]);

  if (uri && !failed) {
    return (
      <Image
        accessibilityLabel={label}
        onError={() => setFailed(true)}
        resizeMode="cover"
        source={{ uri }}
        style={[styles.albumArtwork, style]}
      />
    );
  }

  return (
    <View style={[styles.albumArtwork, styles.albumPlaceholder, style]}>
      <Text style={styles.artworkNote}>♫</Text>
      {year ? <Text style={styles.artworkYear}>{year}</Text> : null}
    </View>
  );
}

export default function App() {
  const [database, setDatabase] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [totalAlbums, setTotalAlbums] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        const db = await Banco();
        await createTable(db);
        const result = await refreshAlbums(db, 1);
        if (active) {
          setDatabase(db);
          setAlbums(result.albums);
          setTotalAlbums(result.totalAlbums);
          setPage(result.currentPage);
          setTotalPages(result.totalPages);
        }
      } catch (initializationError) {
        if (active) {
          setError(`Não foi possível abrir o catálogo: ${initializationError.message}`);
        }
      } finally {
        if (active) setBusy(false);
      }
    }

    initialize();
    return () => {
      active = false;
    };
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError('');
  }

  async function reload(requestedPage) {
    const result = await refreshAlbums(database, requestedPage);
    setAlbums(result.albums);
    setTotalAlbums(result.totalAlbums);
    setPage(result.currentPage);
    setTotalPages(result.totalPages);
  }

  async function saveAlbum() {
    if (!database || busy) return;

    const title = form.titulo.trim();
    const artist = form.artista.trim();
    const yearText = form.ano.trim();
    const genre = form.genero.trim();

    if (!title || !artist || !yearText || !genre) {
      setError('Preencha todos os campos para continuar.');
      return;
    }

    const year = Number(yearText);
    if (!Number.isInteger(year) || year < 1) {
      setError('Informe um ano válido usando apenas números.');
      return;
    }

    const album = {
      titulo: title,
      artista: artist,
      ano: year,
      genero: genre,
      capa: form.capa.trim() || null,
    };
    setBusy(true);
    setError('');
    try {
      if (editingId !== null) {
        await updateAlbum(database, editingId, album);
        await reload(page);
      } else {
        await insertAlbum(database, album);
        await reload(1);
      }
      resetForm();
    } catch (saveError) {
      setError(`Não foi possível salvar o álbum: ${saveError.message}`);
    } finally {
      setBusy(false);
    }
  }

  function startEditing(album) {
    if (busy) return;

    setForm({
      titulo: album.titulo,
      artista: album.artista,
      ano: String(album.ano),
      genero: album.genero,
      capa: album.capa || '',
    });
    setEditingId(album.id);
    setError('');
  }

  async function removeAlbum(id) {
    if (!database || busy) return;

    setBusy(true);
    setError('');
    try {
      await deleteAlbum(database, id);
      await reload(page);
      if (editingId === id) resetForm();
    } catch (deleteError) {
      setError(`Não foi possível excluir o álbum: ${deleteError.message}`);
    } finally {
      setBusy(false);
    }
  }

  function confirmDelete(album) {
    Alert.alert(
      'Excluir álbum',
      `Tem certeza que deseja excluir “${album.titulo}”?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => removeAlbum(album.id),
        },
      ]
    );
  }

  async function changePage(nextPage) {
    if (!database || busy || nextPage < 1 || nextPage > totalPages) return;
    setBusy(true);
    setError('');
    try {
      await reload(nextPage);
    } catch (pageError) {
      setError(`Não foi possível carregar os álbuns: ${pageError.message}`);
    } finally {
      setBusy(false);
    }
  }

  function updateField(field, value) {
    setForm(current => ({ ...current, [field]: value }));
    if (error) setError('');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.hero}>
            <View style={styles.heroTopline}>
              <Text style={styles.musicNote}>♫</Text>
              <Text style={styles.eyebrow}>SEU SOM, SUA COLEÇÃO</Text>
            </View>
            <Text style={styles.heroTitle}>Pop em{"\n"}disco</Text>
            <Text style={styles.heroSubtitle}>
              Um lugar especial para seus álbuns favoritos.
            </Text>
            <View style={styles.albumCount}>
              <Text style={styles.albumCountText}>
                {busy ? '...' : `✦  ${totalAlbums} ${totalAlbums === 1 ? 'ÁLBUM' : 'ÁLBUNS'}`}
              </Text>
            </View>
          </View>

          <View style={styles.body}>
            <View style={styles.sectionHeading}>
              <View>
                <Text style={styles.sectionEyebrow}>
                  {editingId !== null ? 'ATUALIZE SUA COLEÇÃO' : 'ADICIONE À COLEÇÃO'}
                </Text>
                <Text style={styles.sectionTitle}>
                  {editingId !== null ? 'Editar álbum' : 'Novo álbum'}
                </Text>
              </View>
              <Text style={styles.headingIcon}>✦</Text>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.label}>Título do álbum</Text>
              <TextInput
                style={styles.input}
                value={form.titulo}
                onChangeText={value => updateField('titulo', value)}
                placeholder="Ex.: Future Nostalgia"
                placeholderTextColor="#A6A1B2"
                maxLength={120}
                returnKeyType="next"
              />

              <View style={styles.inputRow}>
                <View style={styles.artistField}>
                  <Text style={styles.label}>Artista</Text>
                  <TextInput
                    style={styles.input}
                    value={form.artista}
                    onChangeText={value => updateField('artista', value)}
                    placeholder="Ex.: Dua Lipa"
                    placeholderTextColor="#A6A1B2"
                    maxLength={100}
                    returnKeyType="next"
                  />
                </View>
                <View style={styles.yearField}>
                  <Text style={styles.label}>Ano</Text>
                  <TextInput
                    style={styles.input}
                    value={form.ano}
                    onChangeText={value => updateField('ano', value)}
                    placeholder="2024"
                    placeholderTextColor="#A6A1B2"
                    keyboardType="number-pad"
                    maxLength={4}
                    returnKeyType="next"
                  />
                </View>
              </View>

              <Text style={styles.label}>Gênero</Text>
              <TextInput
                style={styles.input}
                value={form.genero}
                onChangeText={value => updateField('genero', value)}
                placeholder="Ex.: Dance-pop"
                placeholderTextColor="#A6A1B2"
                maxLength={60}
                returnKeyType="done"
                onSubmitEditing={saveAlbum}
              />

              <View style={styles.coverLabelRow}>
                <Text style={styles.label}>URL da capa (opcional)</Text>
                {form.capa.trim() ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => updateField('capa', '')}
                    hitSlop={8}
                  >
                    <Text style={styles.clearCoverText}>Limpar</Text>
                  </Pressable>
                ) : null}
              </View>
              <TextInput
                style={styles.input}
                value={form.capa}
                onChangeText={value => updateField('capa', value)}
                placeholder="https://..."
                placeholderTextColor="#A6A1B2"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                returnKeyType="done"
              />
              {form.capa.trim() ? (
                <View style={styles.coverPreviewRow}>
                  <AlbumArtwork
                    uri={form.capa.trim()}
                    year=""
                    style={styles.coverPreview}
                    label="Pré-visualização da capa"
                  />
                  <Text style={styles.coverPreviewCaption}>
                    Pré-visualização da capa
                  </Text>
                </View>
              ) : null}

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <View style={styles.formActions}>
                <Pressable
                  accessibilityRole="button"
                  disabled={busy}
                  onPress={saveAlbum}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    (pressed || busy) && styles.buttonMuted,
                  ]}
                >
                  <Text style={styles.primaryButtonText}>
                    {editingId !== null ? 'Salvar alterações' : 'Adicionar álbum'}
                  </Text>
                </Pressable>
                {editingId !== null ? (
                  <Pressable
                    accessibilityRole="button"
                    disabled={busy}
                    onPress={resetForm}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>

            <View style={[styles.sectionHeading, styles.listHeading]}>
              <View>
                <Text style={styles.sectionEyebrow}>FEITO PARA OUVIR DE NOVO</Text>
                <Text style={styles.sectionTitle}>Seus álbuns</Text>
              </View>
              <View style={styles.pagePill}>
                <Text style={styles.pagePillText}>{page} / {totalPages}</Text>
              </View>
            </View>

            {albums.length === 0 && !busy ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>♫</Text>
                <Text style={styles.emptyTitle}>Sua coleção está esperando</Text>
                <Text style={styles.emptyText}>Adicione um álbum pelo formulário acima.</Text>
              </View>
            ) : (
              albums.map(album => (
                <View key={album.id} style={styles.albumCard}>
                  <AlbumArtwork
                    key={`${album.id}-${album.capa || ''}`}
                    uri={album.capa}
                    year={album.ano}
                    style={styles.albumArtworkCard}
                    label={`Capa de ${album.titulo}`}
                  />
                  <View style={styles.albumInfo}>
                    <Text style={styles.albumTitle} numberOfLines={2}>{album.titulo}</Text>
                    <Text style={styles.albumArtist} numberOfLines={1}>{album.artista}</Text>
                    <View style={styles.albumMeta}>
                      <View style={styles.genreTag}>
                        <Text style={styles.genreText}>{album.genero}</Text>
                      </View>
                      <View style={styles.yearTag}>
                        <Text style={styles.yearTagText}>{album.ano}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.cardActions}>
                    <Pressable
                      accessibilityRole="button"
                      disabled={busy}
                      onPress={() => startEditing(album)}
                      style={[styles.editButton, busy && styles.buttonMuted]}
                    >
                      <Text style={styles.editButtonText}>Editar</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      disabled={busy}
                      onPress={() => confirmDelete(album)}
                      style={[styles.deleteButton, busy && styles.buttonMuted]}
                    >
                      <Text style={styles.deleteButtonText}>Excluir</Text>
                    </Pressable>
                  </View>
                </View>
              ))
            )}

            <View style={styles.pagination}>
              <Pressable
                accessibilityRole="button"
                disabled={page <= 1 || busy}
                onPress={() => changePage(page - 1)}
                style={[styles.pageButton, (page <= 1 || busy) && styles.pageButtonDisabled]}
              >
                <Text style={[styles.pageButtonText, (page <= 1 || busy) && styles.pageButtonTextDisabled]}>
                  ‹  Anterior
                </Text>
              </Pressable>
              <Text style={styles.pageIndicator}>Página {page} de {totalPages}</Text>
              <Pressable
                accessibilityRole="button"
                disabled={page >= totalPages || busy}
                onPress={() => changePage(page + 1)}
                style={[styles.pageButton, (page >= totalPages || busy) && styles.pageButtonDisabled]}
              >
                <Text style={[styles.pageButtonText, (page >= totalPages || busy) && styles.pageButtonTextDisabled]}>
                  Próxima  ›
                </Text>
              </Pressable>
            </View>
            <Text style={styles.footer}>FEITO COM ♡ PARA QUEM AMA POP</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#88134A' },
  keyboard: { flex: 1, backgroundColor: '#FFF5F8' },
  content: { flexGrow: 1, paddingBottom: 28 },
  hero: {
    backgroundColor: '#88134A',
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroTopline: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  musicNote: { color: '#FDE68A', fontSize: 24, marginRight: 9, fontWeight: '700' },
  eyebrow: { color: '#FBCFE8', fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  heroTitle: { color: '#FFFFFF', fontSize: 40, lineHeight: 43, fontWeight: '800', letterSpacing: -1 },
  heroSubtitle: { color: '#FCE7F3', fontSize: 14, marginTop: 10 },
  albumCount: {
    alignSelf: 'flex-start',
    backgroundColor: '#9D174D',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 18,
  },
  albumCountText: { color: '#FDE68A', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  body: { paddingHorizontal: 18, paddingTop: 24 },
  sectionHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
  },
  sectionEyebrow: { color: '#A56A83', fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  sectionTitle: { color: '#88134A', fontSize: 23, fontWeight: '800', marginTop: 3 },
  headingIcon: { color: '#DB2777', fontSize: 25, paddingRight: 4 },
  formCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#F8D7E5',
    shadowColor: '#88134A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  label: { color: '#6B2949', fontSize: 11, fontWeight: '700', marginBottom: 6 },
  input: {
    backgroundColor: '#FFFAFC',
    borderWidth: 1,
    borderColor: '#F8D7E5',
    borderRadius: 11,
    color: '#4A102B',
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 9,
    marginBottom: 12,
  },
  inputRow: { flexDirection: 'row', alignItems: 'flex-start' },
  artistField: { flex: 1, marginRight: 10 },
  yearField: { width: 90 },
  coverLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  clearCoverText: { color: '#DB2777', fontSize: 11, fontWeight: '800', marginBottom: 6 },
  coverPreviewRow: { flexDirection: 'row', alignItems: 'center', marginTop: -2, marginBottom: 12 },
  coverPreview: { width: 62, height: 62, borderRadius: 10 },
  coverPreviewCaption: { color: '#8B6676', fontSize: 11, marginLeft: 10 },
  errorText: { color: '#B4234D', fontSize: 12, marginBottom: 10, lineHeight: 17 },
  formActions: { flexDirection: 'row', alignItems: 'center', marginTop: 1 },
  primaryButton: {
    flex: 1,
    backgroundColor: '#DB2777',
    minHeight: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  buttonMuted: { opacity: 0.65 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  cancelButton: { paddingHorizontal: 14, paddingVertical: 12, marginLeft: 5 },
  cancelButtonText: { color: '#8B526C', fontSize: 12, fontWeight: '700' },
  listHeading: { marginTop: 28, marginBottom: 13 },
  pagePill: { backgroundColor: '#FCE7F3', paddingHorizontal: 11, paddingVertical: 7, borderRadius: 20 },
  pagePillText: { color: '#9D174D', fontSize: 11, fontWeight: '800' },
  albumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#F8D7E5',
    marginBottom: 10,
    minHeight: 108,
    shadowColor: '#88134A',
    shadowOpacity: 0.04,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  albumArtwork: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
  },
  albumArtworkCard: { flexShrink: 0 },
  albumPlaceholder: {
    backgroundColor: '#FCE7F3',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  artworkNote: { color: '#9D174D', fontSize: 34, fontWeight: '700' },
  artworkYear: { color: '#9D174D', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  albumInfo: { flex: 1, alignSelf: 'stretch', justifyContent: 'center', paddingHorizontal: 10 },
  albumTitle: { color: '#88134A', fontSize: 13, fontWeight: '800', lineHeight: 17 },
  albumArtist: { color: '#8B6676', fontSize: 11, marginTop: 4 },
  albumMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 6, flexWrap: 'wrap' },
  genreTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#FCE7F3',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginRight: 5,
  },
  genreText: { color: '#9D174D', fontSize: 9, fontWeight: '700' },
  yearTag: {
    backgroundColor: '#FFF5F8',
    borderColor: '#F8D7E5',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  yearTagText: { color: '#8B526C', fontSize: 9, fontWeight: '800' },
  cardActions: { alignItems: 'stretch', justifyContent: 'center', marginLeft: 2 },
  editButton: {
    minWidth: 56,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  editButtonText: { color: '#9D174D', fontSize: 11, fontWeight: '800' },
  deleteButton: {
    minWidth: 56,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  deleteButtonText: { color: '#B4234D', fontSize: 11, fontWeight: '700' },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    borderColor: '#F8D7E5',
    borderWidth: 1,
    padding: 24,
  },
  emptyIcon: { color: '#DB2777', fontSize: 32 },
  emptyTitle: { color: '#88134A', fontSize: 15, fontWeight: '800', marginTop: 8 },
  emptyText: { color: '#8B6676', fontSize: 12, marginTop: 5, textAlign: 'center' },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 8,
  },
  pageButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F2B8D0',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  pageButtonDisabled: { backgroundColor: '#FDEBF3', borderColor: '#FDEBF3' },
  pageButtonText: { color: '#9D174D', fontSize: 11, fontWeight: '800' },
  pageButtonTextDisabled: { color: '#C89BAE' },
  pageIndicator: { color: '#6B2949', fontSize: 11, fontWeight: '700' },
  footer: { color: '#A56A83', textAlign: 'center', fontSize: 9, fontWeight: '800', letterSpacing: 1.4, marginTop: 16 },
});
