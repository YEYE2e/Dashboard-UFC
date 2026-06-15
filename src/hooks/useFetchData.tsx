import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export interface Fight {
  id: string;
  event_name: string;
  event_date: string;
  fighter_1: string;
  fighter_2: string;
  method: string;
  round_num: number;
  time: string;
  f1_Height_cm: number;
  f1_Weight_kg: number;
  f1_Reach_cm: number;
  f2_Height_cm: number;
  f2_Weight_kg: number;
  f2_Reach_cm: number;
  event_url: string;
  fight_url: string;
  fighter_1_url: string;
  fighter_2_url: string;
  weight_class: string;
  f1_KD: number;
  f2_KD: number;
  f1_Ctrl: string;
  f2_Ctrl: string;
  event_location: string;
  f1_Stance: string;
  f1_DOB: string;
  f2_Stance: string;
  f2_DOB: string;
  f1_Sig_str_landed: number;
  f1_Sig_str_attempted: number;
  f1_Td_landed: number;
  f1_Td_attempted: number;
  f2_Sig_str_landed: number;
  f2_Sig_str_attempted: number;
  f2_Td_landed: number;
  f2_Td_attempted: number;
  winner: string;
  is_title_fight: boolean;
}

const CACHE_KEY = 'ufc_fights_cache';
const CACHE_TIME_KEY = 'ufc_fights_cache_time';
const CACHE_EXPIRY = 1000 * 60 * 60 * 24; // 24 hours caching

// Minifies Fight objects for localStorage to fit within the 5MB quota
const minifyFights = (fightsList: Fight[]): any[] => {
  return fightsList.map(f => ({
    a: f.id,
    b: f.event_name,
    c: f.event_date,
    d: f.fighter_1,
    e: f.fighter_2,
    f: f.method,
    g: f.round_num,
    h: f.time,
    i: f.f1_Height_cm,
    j: f.f1_Weight_kg,
    k: f.f1_Reach_cm,
    l: f.f2_Height_cm,
    m: f.f2_Weight_kg,
    n: f.f2_Reach_cm,
    o: f.weight_class,
    p: f.f1_KD,
    q: f.f2_KD,
    r: f.f1_Ctrl,
    s: f.f2_Ctrl,
    t: f.event_location,
    u: f.f1_Stance,
    v: f.f1_DOB,
    w: f.f2_Stance,
    x: f.f2_DOB,
    y: f.f1_Sig_str_landed,
    z: f.f1_Sig_str_attempted,
    aa: f.f1_Td_landed,
    ab: f.f1_Td_attempted,
    ac: f.f2_Sig_str_landed,
    ad: f.f2_Sig_str_attempted,
    ae: f.f2_Td_landed,
    af: f.f2_Td_attempted,
    ag: f.winner,
    ah: f.is_title_fight
  }));
};

// Expands minified objects from localStorage back into full Fight objects
const expandFights = (minifiedList: any[]): Fight[] => {
  return minifiedList.map(m => ({
    id: m.a,
    event_name: m.b,
    event_date: m.c,
    fighter_1: m.d,
    fighter_2: m.e,
    method: m.f,
    round_num: m.g,
    time: m.h,
    f1_Height_cm: m.i,
    f1_Weight_kg: m.j,
    f1_Reach_cm: m.k,
    f2_Height_cm: m.l,
    f2_Weight_kg: m.m,
    f2_Reach_cm: m.n,
    event_url: "",
    fight_url: "",
    fighter_1_url: "",
    fighter_2_url: "",
    weight_class: m.o,
    f1_KD: m.p,
    f2_KD: m.q,
    f1_Ctrl: m.r,
    f2_Ctrl: m.s,
    event_location: m.t,
    f1_Stance: m.u,
    f1_DOB: m.v,
    f2_Stance: m.w,
    f2_DOB: m.x,
    f1_Sig_str_landed: m.y,
    f1_Sig_str_attempted: m.z,
    f1_Td_landed: m.aa,
    f1_Td_attempted: m.ab,
    f2_Sig_str_landed: m.ac,
    f2_Sig_str_attempted: m.ad,
    f2_Td_landed: m.ae,
    f2_Td_attempted: m.af,
    winner: m.ag,
    is_title_fight: m.ah
  }));
};

export default function useFetchData() {
  const [fights, setFights] = useState<Fight[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFightsData = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      if (!forceRefresh) {
        const cachedData = localStorage.getItem(CACHE_KEY);
        const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
        
        if (cachedData && cachedTime) {
          const isExpired = Date.now() - parseInt(cachedTime, 10) > CACHE_EXPIRY;
          if (!isExpired) {
            const parsedMinified = JSON.parse(cachedData) as any[];
            setFights(expandFights(parsedMinified));
            setLoading(false);
            return;
          }
        }
      }

      console.log('Fetching from Firestore...');
      const fightsCollection = collection(db, 'ufc_fights');
      const fightsSnapshot = await getDocs(fightsCollection);
      
      const loadedFights: Fight[] = [];
      fightsSnapshot.forEach((doc) => {
        const data = doc.data();
        loadedFights.push({
          id: doc.id,
          ...data
        } as Fight);
      });

      // Ordenar por fecha descendente
      loadedFights.sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());

      if (loadedFights.length > 0) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(minifyFights(loadedFights)));
        localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
        setFights(loadedFights);
      } else {
        setError("La base de datos de Firestore está vacía. Por favor ejecuta el script de seeding.");
      }
    } catch (err: any) {
      console.error(err);
      setError(`Error al conectar con Firebase: ${err.message || 'Verifica la consola para más detalles.'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFightsData();
  }, [fetchFightsData]);

  return { fights, loading, error, refetch: () => fetchFightsData(true) };
}
