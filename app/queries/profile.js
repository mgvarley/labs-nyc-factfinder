import simpleProfile from './profile-simple';

const metadata = 'support_data_dictionary_0610_1216';

const preserveType = function(array) {
  return `'${array.join("','")}'`;
};

const generateProfileSQL = function(geoids, comparator, profile = 'demographic') {
  const ids = preserveType(geoids);

  const [firstGeoid] = geoids;
  const { length: count } = geoids;

  if (count === 1) {
    return simpleProfile(firstGeoid, comparator, profile);
  }

  return `
    WITH
      filtered_selection AS (
        SELECT *
        FROM ${profile}
        WHERE geoid IN (${ids})
      ),

        enriched_selection AS (
          SELECT *
          FROM filtered_selection
          INNER JOIN ${metadata}
            ON ${metadata}.variablename = filtered_selection.variable
        ),

          main_numbers AS (
            SELECT *,
              (((m / 1.645) / NULLIF(SUM,0)) * 100) AS cv
              FROM (
                SELECT
                  sum(e) AS sum,
                  sqrt(sum(power(m, 2))) AS m,
                  max(base) AS base,
                  max(category) AS category,
                  max(profile) as profile,
                  variable,
                  dataset
                FROM enriched_selection
                GROUP BY variable, dataset ) prework
          ),

          base_numbers AS (
            SELECT
              sum(e) AS base_sum,
              sqrt(sum(power(m, 2))) AS base_m,
              max(base) AS base_variable,
              max(DATASET) AS base_dataset
            FROM enriched_selection
            WHERE base = VARIABLE
            GROUP BY VARIABLE, dataset
          ),

      comparison_selection AS (
        SELECT *
        FROM ${profile}
        WHERE geoid IN ('${comparator}')
      ),

        comparison_enriched_selection AS (
          SELECT *
          FROM comparison_selection
          INNER JOIN ${metadata}
            ON ${metadata}.variablename = comparison_selection.variable
        ),

          comparison_main_numbers AS (
            SELECT *,
              (((comparison_m / 1.645) / comparison_sum) * 100) AS comparison_cv
              FROM (
                SELECT
                  sum(e) AS comparison_sum,
                  sqrt(sum(power(m, 2))) AS comparison_m,
                  max(base) AS comparison_base,
                  variable AS comparison_variable,
                  dataset AS comparison_dataset
                FROM comparison_enriched_selection
                GROUP BY variable, dataset ) prework
          ),

          comparison_base_numbers AS (
            SELECT
              sum(e) AS comparison_base_sum,
              sqrt(sum(power(m, 2))) AS comparison_base_m,
              max(base) AS comparison_base_variable,
              max(DATASET) AS comparison_base_dataset
            FROM comparison_enriched_selection
            WHERE base = VARIABLE
            GROUP BY VARIABLE, "dataset"
          )

    SELECT
      *,
      CASE WHEN ABS(SQRT(POWER(m / 1.645, 2) %2B POWER(comparison_m / 1.645, 2)) * 1.645) > ABS(comparison_sum - sum) THEN false ELSE true END AS significant,
      CASE WHEN ABS(SQRT(POWER(percent_m / 1.645, 2) %2B POWER(comparison_percent_m / 1.645, 2)) * 1.645) > ABS(comparison_percent - percent) THEN false ELSE true END AS percent_significant
    FROM (
      SELECT
         *,
        regexp_replace(lower(DATASET), '[^A-Za-z0-9]', '_', 'g') AS DATASET,
        regexp_replace(lower(PROFILE), '[^A-Za-z0-9]', '_', 'g') AS PROFILE,
        regexp_replace(lower(category), '[^A-Za-z0-9]', '_', 'g') AS category,
        regexp_replace(lower(VARIABLE), '[^A-Za-z0-9]', '_', 'g') AS VARIABLE,
        ROUND((SUM / NULLIF(base_sum,0))::numeric, 4) as percent,
        (1 / NULLIF(base_sum,0)) * SQRT(POWER(m, 2) %2B ABS(POWER(sum / NULLIF(base_sum,0), 2) * POWER(base_m, 2))) as percent_m,
        ROUND((comparison_sum / NULLIF(comparison_base_sum,0))::numeric, 4) as comparison_percent,
        (1 / NULLIF(comparison_base_sum,0)) * SQRT(POWER(comparison_m, 2) %2B ABS(POWER(comparison_sum / NULLIF(comparison_base_sum,0), 2) * POWER(comparison_base_m, 2))) as comparison_percent_m
      FROM main_numbers
      INNER JOIN comparison_main_numbers
        ON main_numbers.variable = comparison_main_numbers.comparison_variable
        AND main_numbers.dataset = comparison_main_numbers.comparison_dataset
      LEFT OUTER JOIN base_numbers
        ON main_numbers.base = base_numbers.base_variable
        AND main_numbers.dataset = base_numbers.base_dataset
      LEFT OUTER JOIN comparison_base_numbers
        ON main_numbers.base = comparison_base_numbers.comparison_base_variable
        AND main_numbers.dataset = comparison_base_numbers.comparison_base_dataset
    ) x
  `;
};

export { preserveType };

export default generateProfileSQL;
