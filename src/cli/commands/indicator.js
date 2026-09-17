import { register } from '../router.js';
import * as chartCore from '../../core/chart.js';
import * as indCore from '../../core/indicators.js';
import * as dataCore from '../../core/data.js';

register('indicator', {
  description: 'Indicator tools (add, remove, toggle, set, get)',
  subcommands: new Map([
    ['add', {
      description: 'Add an indicator to the chart',
      options: {
        inputs: { type: 'string', short: 'i', description: 'JSON input overrides' },
      },
      handler: async (opts, positionals) => {
        if (!positionals[0]) throw new Error('Indicator name required. Usage: tv indicator add "Volume"');
        const name = positionals.join(' ');
        const r = await chartCore.manageIndicator({ action: 'add', indicator: name, inputs: opts.inputs });
        if (r && r.success) return r;
        // `createStudy` reaches TradingView's BUILT-IN registry only. A saved
        // Pine script is not in it, so `createStudy` no-ops and reports
        // new_study_count: 0 -- indistinguishable from a bad name. Measured:
        // five failures on saved scripts and one success on a built-in.
        // `addStudyFromSearch` is the DOM-click path that reaches the
        // dialog's `My scripts` section; it already existed here, exposed as
        // an MCP tool and never as a CLI subcommand, so the bridge -- which
        // drives the CLI -- could not reach it.
        const viaSearch = await indCore.addStudyFromSearch({ query: name });
        return { ...viaSearch, fell_back_to_search: true, create_study_result: r };
      },
    }],
    ['remove', {
      description: 'Remove an indicator by entity ID',
      handler: (opts, positionals) => {
        if (!positionals[0]) throw new Error('Entity ID required. Usage: tv indicator remove eFu1Ot');
        return chartCore.manageIndicator({ action: 'remove', indicator: '', entity_id: positionals[0] });
      },
    }],
    ['toggle', {
      description: 'Show or hide an indicator',
      options: {
        visible: { type: 'boolean', description: 'Show (true) or hide (false)' },
        hidden: { type: 'boolean', description: 'Hide the indicator' },
      },
      handler: (opts, positionals) => {
        if (!positionals[0]) throw new Error('Entity ID required. Usage: tv indicator toggle eFu1Ot --visible');
        const visible = opts.hidden ? false : (opts.visible !== undefined ? opts.visible : true);
        return indCore.toggleVisibility({ entity_id: positionals[0], visible });
      },
    }],
    ['set', {
      description: 'Change indicator input values',
      options: {
        inputs: { type: 'string', short: 'i', description: 'JSON input overrides, e.g. \'{"length": 50}\'' },
      },
      handler: (opts, positionals) => {
        if (!positionals[0]) throw new Error('Entity ID required. Usage: tv indicator set eFu1Ot -i \'{"in_3": 20}\'');
        if (!opts.inputs) throw new Error('Inputs required. Usage: tv indicator set eFu1Ot -i \'{"in_3": 20}\'');
        return indCore.setInputs({ entity_id: positionals[0], inputs: opts.inputs });
      },
    }],
    ['get', {
      description: 'Get indicator info and inputs',
      handler: (opts, positionals) => {
        if (!positionals[0]) throw new Error('Entity ID required. Usage: tv indicator get eFu1Ot');
        return dataCore.getIndicator({ entity_id: positionals[0] });
      },
    }],
  ]),
});
