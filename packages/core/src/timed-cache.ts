export interface TimedCacheOptions {
    timeout: number;
    useTimer: boolean;
    createKey: (args: string[]) => string;
}

export function timedCache<T extends (...args: string[]) => string>(
    fn: T,
    { timeout, useTimer, createKey }: TimedCacheOptions
) {
    const cache = new Map();
    let prevTime = Infinity;
    let shouldClean = false;
    const get = (...args: string[]) => {
        if (!shouldClean && useTimer) {
            setTimeout(() => cache.clear(), timeout);
        }
        shouldClean = true;
        const current = Date.now();
        if (current - prevTime > timeout && !useTimer) {
            cache.clear();
        }
        prevTime = current;
        const key = createKey(args);
        let value;
        if (!cache.has(key)) {
            value = fn(...args);
            cache.set(key, value);
        } else {
            value = cache.get(key);
        }
        return value;
    };

    return {
        get: get as T,
        cache
    };
}

// log = console.log

// const resolvedTimed = timedCache(
//     a => {
//         return log('resolved(' + a + ')');
//     },
//     { timeout: 2000, createKey: (args)=> args.join(';') }
// );

// resolvedTimed.get('1');
// log('Z');
// resolvedTimed.get('1');

// resolvedTimed.get('2');
// resolvedTimed.get('2');

// resolvedTimed.get('3');
// log('Z3');

// console.log(resolvedTimed);

// setTimeout(()=>{
// resolvedTimed.get('2');
// log('Z4');

// console.log(resolvedTimed);

// }, 4000)
