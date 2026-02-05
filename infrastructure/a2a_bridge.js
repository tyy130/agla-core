import fs from 'fs';
import path from 'path';

const OPS_LOG = '/home/tyler/agla-core/ops.jsonl';

/**
 * TACTICDEV A2A Protocol: Post a message to the shared team log.
 * @param {string} agent - 'TARS' or 'CASE'
 * @param {string} mission - The mission identifier
 * @param {string} update - The message content
 * @param {object} metadata - Optional technical data
 */
export function postUpdate(agent, mission, update, metadata = {}) {
    const entry = {
        timestamp: new Date().toISOString(),
        agent,
        mission,
        update,
        metadata
    };
    fs.appendFileSync(OPS_LOG, JSON.stringify(entry) + '\n');
    console.log(`[${agent}] Logged update for mission: ${mission}`);
}

/**
 * TACTICDEV A2A Protocol: Read the last X updates from the team.
 * @param {number} limit 
 */
export function getLatest(limit = 5) {
    if (!fs.existsSync(OPS_LOG)) return [];
    const lines = fs.readFileSync(OPS_LOG, 'utf-8').trim().split('\n');
    return lines.slice(-limit).map(l => JSON.parse(l));
}

