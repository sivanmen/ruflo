/**
 * HARMONY SEO CORE v1 (2026-11-16) - per HARMONY SEO+GEO execution brief.
 * Covers: TSF meta in REST (A3/A5), users endpoint lock (A10), robots/sitemap/hreflang (A6),
 * hero eager load (A7), llms.txt (A8), Article schema (A13), security headers + https (A9/A10).
 * Entity graph JSON-LD (A2) lives in WPCode > Header & Footer.
 */
if ( ! defined( 'ABSPATH' ) ) { return; }

if ( ! defined( 'HB_ORG_ID' ) ) {
	define( 'HB_ORG_ID', 'https://harmony-bonds.com/#/schema/Organization' );
	define( 'HB_SIVAN_ID', 'https://sivaninvestgroup.com/#sivan-menahem' );
}

/* ---------- The SEO Framework post meta editable over REST (authorised editors only) ---------- */
add_action( 'init', function () {
	$keys = array( '_genesis_title', '_genesis_description', '_open_graph_title', '_open_graph_description', '_twitter_title', '_twitter_description', '_genesis_noindex', '_genesis_nofollow', '_genesis_canonical', 'exclude_from_archive', 'exclude_local_search', '_tsf_title_no_blogname' );
	foreach ( array( 'post', 'page' ) as $pt ) {
		foreach ( $keys as $k ) {
			register_post_meta( $pt, $k, array(
				'type'          => 'string',
				'single'        => true,
				'show_in_rest'  => true,
				'auth_callback' => function ( $allowed, $key, $id ) { return current_user_can( 'edit_post', $id ); },
			) );
		}
	}
} );

/* ---------- A10: no user enumeration for anonymous visitors ---------- */
add_filter( 'rest_pre_dispatch', function ( $result, $server, $request ) {
	if ( preg_match( '#^/wp/v2/users#', $request->get_route() ) && ! is_user_logged_in() ) {
		return new WP_Error( 'rest_user_cannot_view', 'Sorry, you are not allowed to list users.', array( 'status' => 401 ) );
	}
	return $result;
}, 10, 3 );
add_action( 'template_redirect', function () {
	if ( ! is_user_logged_in() && isset( $_GET['author'] ) ) {
		wp_safe_redirect( home_url( '/' ), 301 );
		exit;
	}
}, 1 );

/* ---------- A6: robots.txt - drop the dead /en/sitemap.xml line ---------- */
add_filter( 'robots_txt', function ( $out ) {
	return preg_replace( '#^Sitemap:\s*\S*/en/sitemap\.xml\s*$#mi', "Sitemap: https://harmony-bonds.com/sitemap.xml?lang=en", $out ) . "\n"; // );
}, 999 );

/* ---------- A6: one sitemap that lists both languages ---------- */
foreach ( array( 'the_seo_framework_sitemap_hpt_query_args', 'the_seo_framework_sitemap_nhpt_query_args', 'the_seo_framework_sitemap_pages_query_args', 'the_seo_framework_sitemap_posts_query_args' ) as $hb_f ) {
	add_filter( $hb_f, function ( $args ) { $args['lang'] = 'he,en'; return $args; } );
}

/* ---------- A6: hreflang x-default -> Hebrew version ---------- */
add_filter( 'pll_rel_hreflang_attributes', function ( $hreflangs ) {
	if ( ! empty( $hreflangs['he'] ) && empty( $hreflangs['x-default'] ) ) {
		$hreflangs['x-default'] = $hreflangs['he'];
	}
	return $hreflangs;
} );

/* ---------- A7: hero image is the LCP element - never lazy ---------- */
add_filter( 'wp_get_attachment_image_attributes', function ( $attr, $attachment ) {
	$hero = (array) get_option( 'hb_hero_attachment_ids', array( 987882 ) );
	if ( $attachment && in_array( (int) $attachment->ID, array_map( 'intval', $hero ), true ) ) {
		$attr['loading']       = 'eager';
		$attr['fetchpriority'] = 'high';
		$attr['decoding']      = 'async';
		$attr['class']         = trim( ( isset( $attr['class'] ) ? $attr['class'] : '' ) . ' no-lazy skip-lazy' );
		$attr['data-no-lazy']  = '1';
		if ( 987882 === (int) $attachment->ID ) { // serve the 40KB WebP copy (media #988284) instead of the 1.5MB PNG
			foreach ( array( 'src', 'srcset' ) as $k ) {
				if ( ! empty( $attr[ $k ] ) ) { $attr[ $k ] = str_replace( array( '/2026/07/harmony-portal-hero', '.png' ), array( '/2026/11/harmony-portal-hero', '.webp' ), $attr[ $k ] ); }
			}
		}
	}
	return $attr;
}, 999, 2 );

/* ---------- A8: /llms.txt served from an option (editable without FTP) ---------- */
add_action( 'parse_request', function () {
	$path = isset( $_SERVER['REQUEST_URI'] ) ? strtok( $_SERVER['REQUEST_URI'], '?' ) : '';
	if ( '/llms.txt' !== $path ) { return; }
	$txt = (string) get_option( 'hb_llms_txt', '' );
	if ( '' === $txt ) { return; }
	status_header( 200 );
	header( 'Content-Type: text/plain; charset=utf-8' );
	header( 'X-Robots-Tag: noindex' );
	echo $txt; // phpcs:ignore
	exit;
}, 0 );

/* ---------- A13: Article schema on every blog post ---------- */
add_action( 'wp_head', function () {
	if ( ! is_singular( 'post' ) ) { return; }
	$p   = get_queried_object();
	$url = get_permalink( $p );
	$au  = get_userdata( $p->post_author );
	if ( $au && in_array( $au->user_login, array( 'sivanmen' ), true ) ) {
		$author = array( '@id' => HB_SIVAN_ID );
	} else {
		$author = array( '@type' => 'Person', 'name' => $au ? $au->display_name : 'HARMONY' );
	}
	$data = array(
		'@context'         => 'https://schema.org',
		'@type'            => 'Article',
		'@id'              => $url . '#article',
		'headline'         => wp_strip_all_tags( get_the_title( $p ) ),
		'mainEntityOfPage' => array( '@id' => $url ),
		'url'              => $url,
		'datePublished'    => get_the_date( 'c', $p ),
		'dateModified'     => get_the_modified_date( 'c', $p ),
		'inLanguage'       => 'he-IL',
		'author'           => $author,
		'publisher'        => array( '@id' => HB_ORG_ID ),
		'isPartOf'         => array( '@id' => 'https://harmony-bonds.com/#/schema/WebSite' ),
	);
	$desc = get_post_meta( $p->ID, '_genesis_description', true );
	if ( ! $desc ) { $desc = has_excerpt( $p ) ? get_the_excerpt( $p ) : ''; }
	if ( $desc ) { $data['description'] = wp_strip_all_tags( $desc ); }
	if ( has_post_thumbnail( $p ) ) {
		$img = wp_get_attachment_image_src( get_post_thumbnail_id( $p ), 'full' );
		if ( $img ) { $data['image'] = array( '@type' => 'ImageObject', 'url' => $img[0], 'width' => $img[1], 'height' => $img[2] ); }
	}
	$about = wp_get_post_terms( $p->ID, array( 'category', 'post_tag' ), array( 'fields' => 'names' ) );
	if ( ! is_wp_error( $about ) && $about ) {
		$data['about'] = array_map( function ( $n ) { return array( '@type' => 'Thing', 'name' => $n ); }, $about );
	}
	echo "\n<script type=\"application/ld+json\" id=\"hb-article-schema\">" . wp_json_encode( $data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ) . "</script>\n";
	$faq = get_post_meta( $p->ID, '_hb_faq_schema', true );
	if ( $faq ) {
		echo '<script type="application/ld+json" id="hb-faq-schema">' . $faq . "</script>\n"; // phpcs:ignore - stored as validated JSON
	}
}, 20 );
add_action( 'init', function () {
	register_post_meta( 'post', '_hb_faq_schema', array( 'type' => 'string', 'single' => true, 'show_in_rest' => true, 'auth_callback' => function ( $a, $k, $id ) { return current_user_can( 'edit_post', $id ); } ) );
} );

/* ---------- A9: security headers for PHP-served responses ---------- */
add_action( 'send_headers', function () {
	if ( is_ssl() ) { header( 'Strict-Transport-Security: max-age=31536000' ); }
	header( 'X-Content-Type-Options: nosniff' );
	header( 'Referrer-Policy: strict-origin-when-cross-origin' );
	header( 'Permissions-Policy: camera=(), microphone=(), geolocation=()' );
} );

/* ---------- A9/A10: same headers + http->https for cache-served pages (.htaccess) ----------
 * Admin-only trigger: /wp-admin/?hb_htaccess=apply | restore | show
 * The original file is saved to the option hb_htaccess_backup before any write. */
add_action( 'admin_init', function () {
	if ( empty( $_GET['hb_htaccess'] ) || ! current_user_can( 'manage_options' ) ) { return; }
	$file = ABSPATH . '.htaccess';
	$cur  = file_exists( $file ) ? file_get_contents( $file ) : '';
	$mode = sanitize_key( $_GET['hb_htaccess'] );
	header( 'Content-Type: text/plain; charset=utf-8' );
	if ( 'show' === $mode ) { echo $cur; exit; }
	if ( 'restore' === $mode ) {
		$bak = get_option( 'hb_htaccess_backup', null );
		if ( null === $bak ) { echo 'NO BACKUP'; exit; }
		echo false !== file_put_contents( $file, $bak ) ? 'RESTORED' : 'WRITE FAILED';
		exit;
	}
	if ( 'apply' === $mode ) {
		if ( null === get_option( 'hb_htaccess_backup', null ) ) { add_option( 'hb_htaccess_backup', $cur, '', 'no' ); }
		$block = "# BEGIN HARMONY-SEO\n<IfModule mod_rewrite.c>\nRewriteEngine On\nRewriteCond %{HTTPS} !=on\nRewriteCond %{HTTP:X-Forwarded-Proto} !https\nRewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]\n</IfModule>\n<IfModule mod_headers.c>\nHeader always set Strict-Transport-Security \"max-age=31536000\"\nHeader always set X-Content-Type-Options \"nosniff\"\nHeader always set Referrer-Policy \"strict-origin-when-cross-origin\"\nHeader always set Permissions-Policy \"camera=(), microphone=(), geolocation=()\"\n</IfModule>\n# END HARMONY-SEO\n\n";
		$clean = preg_replace( '/# BEGIN HARMONY-SEO.*?# END HARMONY-SEO\s*/s', '', $cur );
		echo false !== file_put_contents( $file, $block . $clean ) ? "APPLIED\n\n" . $block : 'WRITE FAILED';
		exit;
	}
} );

/* ---------- settings editable over REST by admins (llms.txt body, hero ids) ---------- */
add_action( 'init', function () {
	register_setting( 'general', 'hb_llms_txt', array( 'type' => 'string', 'show_in_rest' => true, 'default' => '', 'sanitize_callback' => function ( $v ) { return wp_check_invalid_utf8( (string) $v ); } ) );
	register_setting( 'general', 'hb_hero_attachment_ids', array( 'type' => 'array', 'show_in_rest' => array( 'schema' => array( 'type' => 'array', 'items' => array( 'type' => 'integer' ) ) ), 'default' => array( 987882 ) ) );
} );

/* ---------- A6: sitemap request -> query every Polylang language ---------- */
add_action( 'pre_get_posts', function ( $q ) {
	$uri = isset( $_SERVER['REQUEST_URI'] ) ? $_SERVER['REQUEST_URI'] : '';
	if ( preg_match( '#^/(?:[a-z]{2}/)?sitemap[^/]*\.xml#', $uri ) ) { $q->set( 'lang', 'he,en' ); }
}, 1 );

/* ---------- A12: author archives only for authors with published posts ---------- */
add_action( 'template_redirect', function () {
	if ( is_author() ) {
		$a = get_queried_object();
		if ( ! $a || ! count_user_posts( $a->ID, 'post', true ) ) {
			global $wp_query; $wp_query->set_404(); status_header( 404 ); nocache_headers();
		}
	}
}, 2 );
